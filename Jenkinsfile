pipeline {
    agent any
    environment {
        PROJECT_ID = 'sungshinserverpj'
        CLUSTER_NAME = 'k8s'
        LOCATION = 'asia-northeast3-a'
        CREDENTIALS_ID = '8df2a4e9-7b5c-410f-abf0-8a13a0ac0172'
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
