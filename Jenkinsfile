pipeline {
    agent any

    stages {
        stage('Verify Directory Structure') {
            steps {
                script {
                    // Print the current workspace and the contents of relevant directories
                    sh 'pwd'
                    sh 'ls -al'
                    // List the contents of the Jenkins workspace
                    sh 'ls -al /var/lib/jenkins/workspace/Node-todo-app/node-to-do'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: '66432602-95bc-445d-85c2-b3675273b0c0', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                        // Log in to Docker Hub
                        sh 'echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin'
                        // Tag and push the Docker image
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
                        configName: 'AWS EC2', // Ensure this matches your SSH config name in Jenkins
                        transfers: [sshTransfer(
                            sourceFiles: 'node-to-do/*', // Files to upload to EC2 instance
                            execCommand: '''
                                cd /home/ec2-user/node-to-do
                                docker pull daniel530/node-todo-app:latest
                                docker stop node-todo-app || true
                                docker rm node-todo-app || true
                                docker run -d -p 80:3000 --name node-todo-app daniel530/node-todo-app:latest
                            ''',
                            removePrefix: '',
                            remoteDirectory: '/home/ec2-user/node-to-do' // Directory on EC2 where files are deployed
                        )],
                        usePromotionTimestamp: false
                    )]
                )
            }
        }
    }
}
