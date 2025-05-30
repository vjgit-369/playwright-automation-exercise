pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.40.0-focal'
        }
    }
    
    environment {
        TEST_ENV = 'ci'
        CI = 'true'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Install Playwright Browsers') {
            steps {
                sh 'npx playwright install --with-deps chromium firefox'
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('E2E Tests - Chromium') {
                    steps {
                        sh 'npx playwright test tests/enhanced-e2e-journey.spec.js --project=chromium'
                    }
                }
                
                stage('E2E Tests - Firefox') {
                    steps {
                        sh 'npx playwright test tests/enhanced-e2e-journey.spec.js --project=firefox'
                    }
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
            
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
