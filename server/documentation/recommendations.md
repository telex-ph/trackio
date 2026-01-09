# Recommendations

This section include recommendations to improve the overall quality, performance, scalability, etc of the Trackio API

1. **Writing Documentation:** As the project continues to be developed and maintained, it is recommended to add a documentation for every feature created by the developer(s). Please refer to the initially created file structure, and improve it as needed.

2. **File Structure:** The current file structure of this API follows a `Service Layer Architecture` (still in progress). It is recommended to add additional services to each module, similar to what has been implemented in the `Schedule` module. However, if the `Service Layer Architecture` is already implemented and developers find the structure becoming cumbersome, it is recommended to transition to a `Domain-Driven Design` approach. This approach focuses on modeling complex business domains by aligning the code closely with real-world business logic, rules, and concepts, which exactly matches with the current business logic of Telex Philippines

3. **Microservices:** It is an architectural style for building software applications as a collection of small, independent, and loosely coupled services, each responsible for a specific functionality. Instead of building a large monolithic application where all components are tightly integrated, the system is broken into smaller services that can be developed, deployed, and scaled independently. As Telex Philippines continues to create more internal systems, it is recommended to adopt a Microservices architecture. However, it is important to avoid making the services excessively **"micro,"** as this can easily lead to **overengineering**.

   > **Read!** One crucial recommendation is to create a **stand-alone User API** that handles authentication, account creation, role-based access control (RBAC), etc., which other services or systems can depend on. This approach addresses issues such as multiple logins across different internal systems within the company.
