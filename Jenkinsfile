pipeline {
    agent any
    environment {
        PROJECT_ID = 'SungshinServerPj'
        CLUSTER_NAME = 'k8s'
        LOCATION = 'asia-northeast3-a'
        CREDENTIALS_ID = '464b4413-8a66-4df2-82e4-c3e8c0661bce'
    }
    stages {
        stage("Checkout code") {
            steps {
                checkout scm
            }
        }
        stage("Build image") {
            steps {
                script {
                    myapp = docker.build("jiyunjeong/wimb-devops:${env.BUILD_ID}")
                }
            }
        }
        stage("Push image") {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'jiyunJeong') {
                        myapp.push("latest")
                        myapp.push("${env.BUILD_ID}")
                    }
                }
            }
        }
        stage('Deploy to GKE') {
            when {
                branch 'main'
            }
            steps {
                 sh "sed -i 's|jiyunjeong/wimb-devops:latest|jiyunjeong/wimb-devops:${env.BUILD_ID}|g' Deployment.yaml"
                step([$class: 'KubernetesEngineBuilder', 
                          projectId: env.PROJECT_ID, 
                          clusterName: env.CLUSTER_NAME, 
                          location: env.LOCATION, 
                          manifestPattern: 'Deployment.yaml', 
                          credentialsId: env.CREDENTIALS_ID, 
                          verifyDeployments: true])
                
            }
        }
    }
}
