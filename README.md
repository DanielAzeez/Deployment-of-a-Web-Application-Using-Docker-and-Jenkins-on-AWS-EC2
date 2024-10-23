# Deployment of a Web Application Using Docker and Jenkins on AWS EC2
This project demonstrates how to automate the deployment of a simple Node.js to-do application using Docker, Jenkins, and AWS EC2. The to-do app is built and containerized with Docker, and Jenkins is used to set up a CI/CD pipeline to automatically deploy the application to an EC2 instance.

## Features

- **Containerization**: The application is packaged in a Docker container, making it portable and easy to deploy.
- **Continuous Integration and Deployment**: Automated pipeline that pushes updates and deploys the application to AWS EC2.
- **Real-Time To-Do Management**: Users can create, update, and delete to-do items in real-time.

## Technologies Used

- **Node.js**: The runtime environment for building the application.
- **Docker**: Used for containerizing the application to simplify deployments.
- **Jenkins**: A popular open-source automation server to implement CI/CD pipelines.
- **AWS EC2**: Provides scalable computing capacity to host the application.

## Project Structure

- **Dockerfile**: Specifies the steps to build the Docker image, including installing dependencies and copying application files.
- **docker-compose.yml**: Configuration file for defining and running multi-container Docker applications.
- **app.js**: The main application code that handles server requests and responses.
- **package.json**: Contains metadata about the project and its dependencies.
- **views/todo.ejs**: EJS template for rendering the to-do list interface.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DanielAzeez/Deployment-of-a-Web-Application-Using-Docker-and-Jenkins-on-AWS-EC2.git
   cd Deployment-of-a-Web-Application-Using-Docker-and-Jenkins-on-AWS-EC2
   ```

2. **Install Node.js dependencies**:
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Build the Docker image**:
   To build the Docker image locally, run:
   ```bash
   docker build -t node-todo-app .
   ```

## Configuration

### AWS EC2 Setup

1. **Launch an EC2 instance**:
   - Use Amazon Linux or Ubuntu as the operating system.
   - Configure security groups to allow inbound traffic on port 80 (HTTP).

2. **Install Docker**:
   Follow the instructions for installing Docker on your chosen EC2 instance.

### Jenkins Setup

1. **Install Jenkins**:
   - Set up Jenkins on a separate EC2 instance or on the same instance where Docker is running.

2. **Configure Jenkins**:
   - Install necessary plugins (e.g., Docker Pipeline).
   - Set up credentials for Docker Hub in Jenkins.

## Jenkins Pipeline

The Jenkins pipeline is defined in a `Jenkinsfile` and automates the process of building the Docker image, pushing it to Docker Hub, and deploying it to AWS EC2. Here’s a breakdown of the stages:

```groovy
pipeline {
    agent any

    stages {
        stage('Verify Directory Structure') {
            steps {
                script {
                    sh 'pwd'
                    sh 'ls -al'
                    sh 'ls -al /var/lib/jenkins/workspace/Node-todo-app/node-to-do'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'your-credentials-id', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                        sh 'echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin'
                        sh 'docker tag node-todo-app $DOCKERHUB_USERNAME/node-todo-app:latest'
                        sh 'docker push $DOCKERHUB_USERNAME/node-todo-app:latest || exit 1'
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshPublisher(
                    publishers: [sshPublisherDesc(
                        configName: 'AWS EC2',
                        transfers: [sshTransfer(
                            sourceFiles: 'node-to-do/*',
                            execCommand: '''
                                cd /home/ec2-user/node-to-do
                                docker pull your-dockerhub-username/node-todo-app:latest
                                docker stop node-todo-app || true
                                docker rm node-todo-app || true
                                docker run -d -p 80:3000 --name node-todo-app your-dockerhub-username/node-todo-app:latest
                            ''',
                            remoteDirectory: '/home/ec2-user/node-to-do'
                        )],
                        usePromotionTimestamp: false
                    )]
                )
            }
        }
    }
}
```

### Key Stages Explained:

- **Verify Directory Structure**: Checks the current working directory and lists its contents to ensure all necessary files are present.
- **Push Docker Image**: Authenticates with Docker Hub, tags the Docker image, and pushes it to the repository for deployment.
- **Deploy to EC2**: Uses SSH to connect to the EC2 instance, pulls the latest Docker image, stops any existing containers, and runs a new container.

## Usage

After the Jenkins pipeline runs successfully, you can access the Node.js application via the public IP address of your EC2 instance on port 80. 

### Example Access
Open a web browser and navigate to:
```
http://<your-ec2-public-ip>/
```

You should see the to-do application interface, where you can add, update, or remove tasks.
