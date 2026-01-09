# Non-Sucking Service Manager Setup and Configuration

NSSM is a service helper that can run programs or scripts in a computer. It automatically start any programs at boot and restarting it if it crashes.

# What is it for?

We need a way for the two biometric devices to send all logs and events of every employee to Trackio for time-in, break, and time-out tracking. However, upon implementation, the devices cannot directly connect to the Trackio API due to TLS/SSL connection issues or some sort.

To resolve this, a middle-man is required to receive all logs from the biometric devices and forward them to the API.

The printer server currently acts as this middle-man. However, this is not an industry-standard solution, but rather a temporary band-aid solution. It is recommended that the biometrics-script be migrated to a dedicated server if one is available.

To better understand the process, refer to the simple illustration below:

- **2 Biometrics** → **Middle-man (Print Server)** → **Trackio API**

# How to setup and configure

## Migrating Biometrics Relay to a Dedicated Server

Follow the steps below when migrating the biometrics-relay script to a dedicated server

1. Navigate to https://github.com/telex-ph/biometrics-relay, which is the source code for the biometrics-relay script
2. Clone the repo using the command `git clone https://github.com/telex-ph/biometrics-relay`
3. Check the current IP address of the server using the command `ipconfig` and look for `IPv4 Address . . . . . . : 192.168.x.x`
4. Go to [biometricsIp.js](../../constants/biometricsIp.js). Enter those individual IP address to the browser which should open the admin panel of HikVision.
5. Enter the username and password (refer to IT Department for the credentials)
6. Navigate to the `Network` -> `Advanced Settings` -> `Http Listening` and ensure that the IP Address and port points to the proper address of the server.
7. Run the biometrics script as initialized at `package.json`

## Configuration and Installation

Follow the steps below to configure and install the biometrics-relay script on a dedicated server.

### 1. Prerequisites

Before installation, ensure the following are ready:

- A server running Windows or Linux.
- Node.js installed (version 16 or higher recommended).
- Git installed for cloning repositories.
- Network access to the HikVision biometric devices.
- Credentials for the HikVision admin panel (from the IT Department).

### 2. Set up as a Windows Service using NSSM

- Install the required Node.js dependencies: `npm install`
- Open Command Prompt as Administrator.
- Install the biometrics-relay script as a service with NSSM: `nssm install biometrics-relay`
- In the NSSM GUI:
  - Path: Point to your Node.js executable, e.g., `C:\Program Files\nodejs\node.exe`
  - Startup directory: The folder where `biometrics-relay` is cloned.
  - Arguments: `package.json`
- Click `Install Service`.
- Start the service: `nssm start biometrics-relay`
- Navigate to [Render](https://render.com/) and verify that the service is running and the script is relaying logs from the biometric devices.

> **Warning!** Because of the constant connection with the biometrics and server, it is important to remember to check the connection during power outage, internet connectivity issue, ensure the print server is turned on, and that the biometrics devices correctly match the IP addresses defined in [biometricsIp.js](../../constants/biometricsIp.js) to keep the attendance system running properly.
