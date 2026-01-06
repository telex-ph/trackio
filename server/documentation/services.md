# Trackio Dependencies

This file focuses on explaining the different services that Trackio depends on, including the cloud and database hosting provider, domain (telextrackio.com), media management service and email messaging. It also discusses the roles of the different services as well as how to log in or which account should be used.

## Set up 2-Factor Authentication

Some accounts used in Trackio have 2-Factor Authentication enabled. This section provides step-by-step instructions to set it up

1. Download Google's Authenticator app in Playstore.
2. Login the telex.github email account.
3. Navigate to the account. (you should a 6-digit code)

## Services used in Trackio

Below is the list of services used in Trackio:

1. [Render](https://render.com/): Is a cloud hosting platform that allows you to deploy and run applications on the internet. It takes your code, builds it, and runs it on cloud servers, keeping it accessible via a public URL. Render is commonly used for backend APIs, web applications, databases, and background workers or scheduled tasks.

   **How to login:**

   - Navigate to [Render](https://render.com/) and click Sign In
   - Click Sign in using Github
   - Enter telex.github gmail and password
   - Go to Google Authenticator app and enter the 6-digit codes

   As of writing this documention (Jan 6, 2025), we have 3 services/projects:

   1. **TicketIO**: the service where the IT ticketing system is running.
   2. **Trackio**: the service where our centralized operation platform is running.
   3. **WanderWave Travel and Tours**: WTT's internal system

2. [Hostinger](https://www.hostinger.com): The service where Trackio’s domain (telextrackio.com) is registered and managed. This means that all domain-related settings—like DNS records, domain renewal, and email routing—are handled through Hostiner. Essentially, Hostiner acts as the official “owner” of the domain, allowing Trackio to connect its website and services to this web address.

   **How to login:**

   _Please refer to the **Marketing Head** for the correct credentials._

   > **Note!** If you are planning to implement a Microservices, this is where you DNS this is where you manage and configure DNS records for the domain.

   As of writing this documentation:
   The DNS records stored here include both the frontend and backend records.

3. [Cloudinary](https://cloudinary.com/): Cloud-based media management platform that helps developers store, transform (edit, resize, crop), optimize, and deliver images and videos for websites and apps through powerful APIs and tools, automating the media pipeline to improve performance, user experience, and efficiency without complex manual work.

   How to login:

   - Navigate to [Cloudinary](https://cloudinary.com/) and click Login
   - Enter innovation gmail and password

   All files on this platform are stored here, including but not limited to:
   evidence, NTE, escalate, MOM, NDA, leave, announcements, recognition, and course files.

   Navigate to [uploadRoutes.js](../src/routes/uploadRoutes.js) for more details.

4. [Resend](http://resend.com/) A service used in Trackio to send emails, including password reset links to users.

   **How to login:**

   - Add a Chrome profile
   - Click Sign in button
   - Enter telex.github gmail and password
   - Go to Google Authenticator app and enter the 6-digit codes if prompted
   - Navigate to [Resend](https://resend.com/) and click Login In
   - Click Login with Google

   > **Note!** If you are planning to implement a Microservices, this is where you DNS this is where you manage and configure DNS records for the domain.

# Recommendation

Please add all the services used as the system progres
