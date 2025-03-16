# MovieApp - Movie/Series Streaming Platform
This repository contains the infrastructure code for a cloud-native movie and series platform built using AWS services. The platform is designed to provide a scalable, reliable, and high-performance environment for managing and streaming movie content. The infrastructure is defined using AWS CDK (Cloud Development Kit), which allows for the creation and management of AWS resources through code.

![diagram](https://github.com/user-attachments/assets/493e1472-c2d4-4d0c-8b65-ffa82ed3a899)

## User Roles
### Unauthenticated Users
* **Registration**: Users can create an account by providing personal details and setting a password.  
  
* **Login**: Registered users can log in using their credentials.

### Regular Users
* **Search and View**: Users can search for and view movie content and metadata.  

* **Download**: Users can download movies for offline viewing.  

* **Rate and Review**: Users can rate movies and leave reviews.  

* **Subscribe**: Users can subscribe to specific movies or series to receive notifications when new content is added.  

* **Personalized Feed**: Users have a personalized feed based on their interactions and preferences.  

### Administrators
* **Content Management**: Administrators can upload, edit, and delete movie content and metadata.

* **User Management**: Administrators can manage user roles and permissions.  

## Key Features

### Content Management
* **Upload Movies**: Administrators can upload movies along with metadata such as title, description, genre, and actors.

* **Edit Metadata**: Administrators can update movie metadata, including descriptions, genres, and actor information.

* **Delete Content**: Administrators can remove movies and associated metadata from the platform.

### User Interaction
* **Search**: Users can search for movies by title, genre, director, or actor.

* **Streaming**: Users can stream movies directly from the platform.

* **Download**: Users can download movies for offline viewing.

* **Rate and Review**: Users can rate movies and leave reviews, which are stored and displayed for other users.

* **Subscriptions**: Users can subscribe to specific movies or series to receive notifications when new content is added.

### Notifications
* **Subscription Alerts**: Users receive notifications when new content they are subscribed to is uploaded.

* **Personalized Feed**: Users have a feed that displays content based on their interactions, such as recently viewed or highly rated movies.

### Transcoding
* **Multi-Resolution Support**: The platform supports transcoding movies into different resolutions to ensure optimal streaming quality based on the user's device and internet connection.
