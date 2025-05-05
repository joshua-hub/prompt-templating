# Kubernetes Deployment for Prompt Template System

This directory contains the Kubernetes manifests for deploying the Prompt Template System.

## Components

1. Backend - FastAPI application
2. Frontend - React application
3. Qdrant - Vector database
4. Persistent Volumes - For uploaded policies and vector database storage

## Prerequisites

- Kubernetes cluster running version 1.18+
- kubectl installed and configured
- A private container registry (optional)

## Configuration

1. Update the image references in the deployment files:
   - Replace `${REGISTRY_URL}` with your container registry URL

2. Update the Secret with your API key:
   - Edit `secret.yaml` and replace `your-api-key-here` with your actual OpenAI API key

3. Configure the Ingress:
   - Edit `frontend-deployment.yaml` and update the host in the Ingress resource

4. Adjust the PersistentVolume settings:
   - If using a cloud provider, adjust the storage class and access modes accordingly
   - The default setup is configured for on-premises deployment with hostPath volumes

## Deployment

### Deploy using kubectl

```bash
# Apply all resources
kubectl apply -k .

# Verify deployments
kubectl get deployments
kubectl get pods
kubectl get pvc
kubectl get pv
kubectl get ingress
```

### Deploy using Kustomize

```bash
# Build and apply
kustomize build . | kubectl apply -f -
```

## Accessing the Application

- If using the Ingress resource, the application will be available at the configured hostname
- For local testing, you can use port-forwarding:

```bash
# Forward frontend
kubectl port-forward svc/prompt-template-frontend 8080:80

# Forward backend
kubectl port-forward svc/prompt-template-backend 8000:8000
```

Then access the application at http://localhost:8080

## Volumes

The application uses two persistent volumes:

1. `prompt-template-uploads-pv` - For storing uploaded policy documents
2. `prompt-template-qdrant-pv` - For storing vector database data

Both are configured as hostPath volumes by default. For production use, consider using cloud provider volumes or network storage solutions. 