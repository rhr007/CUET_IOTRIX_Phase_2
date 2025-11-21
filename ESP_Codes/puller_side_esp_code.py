"""
CUET IOTRIX Phase 2 - Puller Side ESP32 Code
Enhanced with real-time notifications and ride management
"""

from machine import Pin, I2C
from time import sleep, time
import urequests
import network

# Configuration
SERVER_IP = '192.168.1.106'
SERVER_PORT = 8000
PULLER_ID = 1  # Configure this per puller device

# Hardware Setup
# OLED Display (Optional)
try:
    import ssd1306
    i2c = I2C(0, scl=Pin(22), sda=Pin(21))
    oled = ssd1306.SSD1306_I2C(128, 64, i2c)
    OLED_AVAILABLE = True
except:
    OLED_AVAILABLE = False
    print("OLED not available, using serial output only")

# LEDs for status
led_idle = Pin(25, Pin.OUT)       # White - No requests
led_request = Pin(26, Pin.OUT)    # Yellow - New request available
led_active = Pin(14, Pin.OUT)     # Green - Ride in progress

# Buzzer for notifications
buzzer = Pin(12, Pin.OUT)

# Buttons for ride control
btn_accept = Pin(23, Pin.IN, Pin.PULL_DOWN)    # Accept ride
btn_reject = Pin(4, Pin.IN, Pin.PULL_DOWN)     # Reject ride
btn_complete = Pin(13, Pin.IN, Pin.PULL_DOWN)  # Complete ride

# System states
STATE_IDLE = 0
STATE_REQUEST_AVAILABLE = 1
STATE_RIDE_ACTIVE = 2

current_state = STATE_IDLE
current_ride_id = None
pending_requests = []
last_check_time = 0
CHECK_INTERVAL = 3  # Check for new requests every 3 seconds

# WiFi Connection
def connect_wifi():
    sta_if = network.WLAN(network.STA_IF)
    if not sta_if.isconnected():
        print('Connecting to WiFi...')
        sta_if.active(True)
        sta_if.connect('NMARS', '2122232425')  # Change to your WiFi credentials
        
        timeout = 20
        while not sta_if.isconnected() and timeout > 0:
            sleep(1)
            timeout -= 1
            
        if sta_if.isconnected():
            print('WiFi connected:', sta_if.ifconfig())
            return True
        else:
            print('WiFi connection failed')
            return False
    return True

# Display functions
def display_message(line1, line2="", line3=""):
    if OLED_AVAILABLE:
        oled.fill(0)
        oled.text(line1, 5, 10)
        if line2:
            oled.text(line2, 5, 30)
        if line3:
            oled.text(line3, 5, 50)
        oled.show()
    print(f"{line1} {line2} {line3}")

def set_state(state):
    global current_state
    current_state = state
    
    # Turn off all LEDs
    led_idle.value(0)
    led_request.value(0)
    led_active.value(0)
    
    # Set appropriate LED and display
    if state == STATE_IDLE:
        led_idle.value(1)
        display_message("PULLER READY", "Waiting for", "requests...")
    elif state == STATE_REQUEST_AVAILABLE:
        led_request.value(1)
        # Notification beep
        buzzer.value(1)
        sleep(0.2)
        buzzer.value(0)
    elif state == STATE_RIDE_ACTIVE:
        led_active.value(1)
        display_message("RIDE ACTIVE", "Press button to", "complete")

# API Calls
def fetch_pending_requests():
    global pending_requests
    
    try:
        url = f"http://{SERVER_IP}:{SERVER_PORT}/puller/requests"
        response = urequests.get(url)
        
        if response.status_code == 200:
            pending_requests = response.json()
            return pending_requests
        else:
            print(f"Error fetching requests: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error: {e}")
        return []
    finally:
        try:
            response.close()
        except:
            pass

def accept_ride(ride_id):
    global current_ride_id
    
    try:
        url = f"http://{SERVER_IP}:{SERVER_PORT}/puller/accept?ride_id={ride_id}&puller_id={PULLER_ID}"
        response = urequests.post(url)
        
        if response.status_code == 200:
            current_ride_id = ride_id
            print(f"Ride {ride_id} accepted")
            set_state(STATE_RIDE_ACTIVE)
            return True
        else:
            print(f"Error accepting ride: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        try:
            response.close()
        except:
            pass

def reject_ride(ride_id):
    try:
        url = f"http://{SERVER_IP}:{SERVER_PORT}/puller/reject?ride_id={ride_id}&puller_id={PULLER_ID}"
        response = urequests.post(url)
        
        if response.status_code == 200:
            print(f"Ride {ride_id} rejected")
            return True
        else:
            print(f"Error rejecting ride: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        try:
            response.close()
        except:
            pass

def complete_ride(ride_id):
    global current_ride_id
    
    try:
        url = f"http://{SERVER_IP}:{SERVER_PORT}/puller/complete?ride_id={ride_id}&puller_id={PULLER_ID}"
        response = urequests.post(url)
        
        if response.status_code == 200:
            data = response.json()
            points = data.get('points_awarded', 100)
            print(f"Ride {ride_id} completed! Earned {points} points")
            
            # Celebration beeps
            for _ in range(3):
                buzzer.value(1)
                sleep(0.2)
                buzzer.value(0)
                sleep(0.1)
            
            display_message("COMPLETED!", f"+{points} points", "Great job!")
            sleep(3)
            
            current_ride_id = None
            set_state(STATE_IDLE)
            return True
        else:
            print(f"Error completing ride: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        try:
            response.close()
        except:
            pass

def check_active_rides():
    global current_ride_id
    
    try:
        url = f"http://{SERVER_IP}:{SERVER_PORT}/puller/accepted?puller_id={PULLER_ID}"
        response = urequests.get(url)
        
        if response.status_code == 200:
            rides = response.json()
            if rides and len(rides) > 0:
                current_ride_id = rides[0]['id']
                set_state(STATE_RIDE_ACTIVE)
            return rides
        else:
            return []
            
    except Exception as e:
        print(f"Error checking active rides: {e}")
        return []
    finally:
        try:
            response.close()
        except:
            pass

# Button handlers
def handle_buttons():
    global current_ride_id, pending_requests
    
    if current_state == STATE_REQUEST_AVAILABLE and pending_requests:
        if btn_accept.value():
            ride = pending_requests[0]
            print(f"Accepting ride to {ride['destination']}")
            if accept_ride(ride['id']):
                pending_requests = []
            sleep(0.3)  # Debounce
            
        elif btn_reject.value():
            ride = pending_requests[0]
            print(f"Rejecting ride to {ride['destination']}")
            if reject_ride(ride['id']):
                pending_requests.pop(0)
                if not pending_requests:
                    set_state(STATE_IDLE)
            sleep(0.3)  # Debounce
            
    elif current_state == STATE_RIDE_ACTIVE and current_ride_id:
        if btn_complete.value():
            print("Completing ride...")
            complete_ride(current_ride_id)
            sleep(0.3)  # Debounce

# Main program
def main():
    global last_check_time, pending_requests
    
    print("CUET IOTRIX Phase 2 - Puller ESP32")
    print("Connecting to WiFi...")
    
    if not connect_wifi():
        print("Failed to connect to WiFi. Please check credentials.")
        return
    
    print("System ready!")
    
    # Check for any active rides on startup
    check_active_rides()
    
    if current_state != STATE_RIDE_ACTIVE:
        set_state(STATE_IDLE)
    
    while True:
        try:
            current_time = time()
            
            # Handle button presses
            handle_buttons()
            
            # Check for new requests periodically (only if idle)
            if current_state == STATE_IDLE and current_time - last_check_time >= CHECK_INTERVAL:
                last_check_time = current_time
                
                requests = fetch_pending_requests()
                
                if requests:
                    pending_requests = requests
                    ride = requests[0]
                    print(f"New ride request to {ride['destination']}")
                    display_message("NEW REQUEST!", 
                                  f"To: {ride['destination']}", 
                                  "Accept/Reject?")
                    set_state(STATE_REQUEST_AVAILABLE)
            
            # If in active ride state, check if ride still exists
            elif current_state == STATE_RIDE_ACTIVE and current_time - last_check_time >= CHECK_INTERVAL:
                last_check_time = current_time
                active_rides = check_active_rides()
                
                if not active_rides:
                    # Ride might have been completed or cancelled
                    current_ride_id = None
                    set_state(STATE_IDLE)
            
            sleep(0.2)
            
        except Exception as e:
            print(f"Main loop error: {e}")
            sleep(1)

# Run the program
if __name__ == "__main__":
    main()
