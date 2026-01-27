#!/bin/bash

echo "Setting up MongoDB on Kubernetes..."

# Create namespace
kubectl create namespace database

# Create secret
kubectl create secret generic mongodb-secret \
  --namespace=database \
  --from-literal=username=admin \
  --from-literal=password=$(openssl rand -base64 12)

# Apply manifests
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mongodb-sc
  namespace: database
provisioner: rancher.io/local-path
reclaimPolicy: Retain
volumeBindingMode: WaitForFirstConsumer
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: database
spec:
  ports:
  - port: 27017
  selector:
    app: mongodb
  clusterIP: None
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: database
spec:
  serviceName: mongodb
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6.0
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: username
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: password
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1"
        volumeMounts:
        - name: data
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: mongodb-sc
      resources:
        requests:
          storage: 4Gi
EOF

echo "Waiting for MongoDB to start..."
sleep 10
kubectl wait --for=condition=ready pod/mongodb-0 -n database --timeout=120s

echo "MongoDB is ready!"
echo "Connection string: mongodb://admin:$(kubectl get secret mongodb-secret -n database -o jsonpath='{.data.password}' | base64 --decode)@mongodb.database.svc.cluster.local:27017"