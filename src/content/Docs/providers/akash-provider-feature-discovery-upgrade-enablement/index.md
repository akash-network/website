---
categories: ["Providers"]
tags: []
weight: 2
title: "Akash Provider Feature Discovery Upgrade/Enablement"
linkTitle: "Akash Provider Feature Discovery Upgrade/Enablement"
---

The following provides an overview of the steps necessary to upgrade your Akash provider to version `0.5.4` and to enable Feature Discovery:

- [Akash Hostname Operator Upgrade](#akash-hostname-operator-upgrade)
- [Akash Inventory Operator Install/Upgrade](#akash-inventory-operator-installupgrade)
  - [Default Helm Chart - values.yaml file](#default-helm-chart---valuesyaml-file)
  - [Non-Persistent Storage Providers](#non-persistent-storage-providers)
  - [Persistent Storage Providers](#persistent-storage-providers)
- [Akash IP Operator Upgrade (If Applicable)](#akash-ip-operator-upgrade-if-applicable)
- [Update Ingress Controller](#update-ingress-controller)
- [Akash Provider Upgrade](#akash-provider-upgrade)
- [Verifications](#verifications)
  - [Example/Expected Output](#exampleexpected-output)
- [Testing](#testing)
  - [Template](#template)
  - [Example/Expected Output](#exampleexpected-output-1)

> _**GPU PROVIDERS -**_ ensure that your GPU models exist in this [database/JSON file](https://github.com/akash-network/provider-configs/blob/main/devices/pcie/gpus.json) before proceeding. If your GPU models do not yet exist in this file - please first follow the procedure outlined in this [GPU Configuration Integration Guide](/docs/providers/provider-feature-discovery-gpu-configuration-integration-guide) to capture your GPU vendor/model IDs and then allow the Akash core team to populate the JSON file prior to upgrading your provider.

### Akash Hostname Operator Upgrade

```
# If this is being executed on machine that does not yet have the Akash
# Helm Chart repo, first follow the steps in this guide to install Helm and pull down
# the Akash repo:
# https://docs.akash.network/providers/build-a-cloud-provider/akash-cloud-provider-build-with-helm-charts/#step-4-helm-installation-on-kubernetes-node

helm repo update

helm uninstall akash-hostname-operator -n akash-services

helm install akash-hostname-operator akash/akash-hostname-operator -n akash-services
```

### Akash Inventory Operator Install/Upgrade

> _**NOTE**_ - the Inventory Operator is now required on ALL Akash Providers. Previously this operator was only required when the Provider hosted persistent storage. But the operator is now mandated on all providers.

> _**NOTE**_ - if your provider hosts persistent storage, ensure that the CEPH cluster is in a healthy state prior to upgrading the Akash Inventory Operator

#### Default Helm Chart - values.yaml file

- The `values.yaml` file for the inventory operator defaults are as follows

```
# Default values for inventory-operator.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

image:
  repository: ghcr.io/akash-network/provider
  pullPolicy: IfNotPresent

inventoryConfig:
  # Allow users to specify cluster storage options
  cluster_storage:
    - default
    - beta2
  exclude:
    nodes: []
    node_storage: []
```

#### Non-Persistent Storage Providers

```
# Note - the uninstall command will produce an error if there was no prior install.
# Safely disregard this error and proceed.
helm uninstall inventory-operator -n akash-services

helm install inventory-operator akash/akash-inventory-operator -n akash-services
```

#### Persistent Storage Providers

- Use these commands to install the inventory operator with the correct cluster storage settings
- In the following command example we are updating the chart with `beta3` persistent storage type such as - `inventoryConfig.cluster_storage[1]=beta3`. Adjust as necessary for your needs.
- The `default` label can be used and left as is in all circumstances.

```
# Note - the uninstall command will produce an error if there was no prior install.
# Safely disregard this error and proceed.
helm uninstall inventory-operator -n akash-services

helm install inventory-operator akash/akash-inventory-operator -n akash-services --set inventoryConfig.cluster_storage[0]=default,inventoryConfig.cluster_storage[1]=beta3
```

### Akash IP Operator Upgrade (If Applicable)

> _**NOTE**_ - the IP Operator is only necessary if your Akash Provider provides IP Leases

```
helm uninstall akash-ip-operator -n akash-services

### Update the `<provider-address>` placeholder with the address of your provider
helm install akash-ip-operator akash/akash-ip-operator -n akash-services --set provider_address=<provider-address>
```

### Update Ingress Controller

> _**NOTE**_ - this step must be completed by all providers to expose the Feature Discovery gRPC port

> _**NOTE**_ - ensure to open port `8444` on your firewall if necessary as well

The Ingress Controller rules have been updated to include Feature Discovery destinations and mainly port `8444`. Update your ingress controller to ensure they are current via the instructions in this doc [section](/docs/providers/build-a-cloud-provider/akash-cloud-provider-build-with-helm-charts/#step-8-ingress-controller-install).

### Akash Provider Upgrade

> _**NOTE**_ - these instructions assume your Akash Provider settings are stored in `/root/provider/provider.yaml`. If this is not the cause - dump current provider settings prior to initiating this process via the following command and ensure the `helm install` command points to the location of this file.\
> \
> `helm -n akash-services get values akash-provider > provider.yaml`

> _**NOTE**_ - provider GPU attributes must now adhere to the naming conventions in this [JSON file](https://github.com/akash-network/provider-configs/blob/main/devices/pcie/gpus.json). Your attributes may need to be updated to follow these standards. If your provider attributes do not adhere to the naming conventions in this JSON file it may not bid when specific models are included in the SDL. If the GPU model has multiple memory options the attributes should be in the form such as the following where again the model and the RAM spec use the nomenclatures of the JSON file.

```
- key: capabilities/gpu/vendor/nvidia/model/a100
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/a100/ram/80Gi
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/a100/ram/80Gi/interface/pcie
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/a100/interface/pcie
    value: true
```

> _**NOTE**_ - if your provider uses a custom price script - ensure to add pointer to that script in the `helm install` command such as the following. Note that this syntax assumes the pricing script resides in the `/root/provider` directory.
>
> Begin by replacing the bid price script with the latest version:\
> \
> `mv price_script_generic.sh price_script_generic.sh.old`&#x20;
>
> `wget https://raw.githubusercontent.com/akash-network/helm-charts/main/charts/akash-provider/scripts/price_script_generic.sh`
>
> And then use `set` option below in the `helm install` command\
> \
> `--set bidpricescript="$(cat /root/provider/price_script_generic.sh | openssl base64 -A)"`

```
cd /root/provider

helm uninstall akash-provider -n akash-services

helm install akash-provider akash/provider -n akash-services -f provider.yaml
```

### Verifications

- Verify the status of the Akash Provider and Akash Operators following the upgrade

```
kubectl get pods -n akash-services
```

#### Example/Expected Output

> Note - pay particular attention to the presence of the `operator-inventory-hardware-discovery`. One such pod should be spawned for each Kubernetes worker node.

```
kubectl get pods -n akash-services
NAME                                          READY   STATUS    RESTARTS       AGE
akash-node-1-0                                1/1     Running   2 (2d2h ago)   2d21h
akash-provider-0                              1/1     Running   0              3m48s
operator-hostname-6f9d7cb465-bdrpb            1/1     Running   0              4m42s
operator-inventory-6f6986496b-8dljm           1/1     Running   0              3m41s
operator-inventory-hardware-discovery-node1   1/1     Running   0              3m39s
operator-inventory-hardware-discovery-node2   1/1     Running   0              3m39s
operator-inventory-hardware-discovery-node3   1/1     Running   0              3m38s
```

### Testing

Test your Akash Provider's Feature Discovery functionality via the use of gRPC CuRL and examples provided below. If you do not have gRPC CuRL installed - follow the instructions in this [guide](https://github.com/fullstorydev/grpcurl) to install via brew.

#### Template

- Replace `<PROVIDER-IP-ADDRESS>` with actual

```
grpcurl -insecure <PROVIDER-DOMAIN>:8444 akash.provider.v1.ProviderRPC.GetStatus
```

#### Example/Expected Output

````
```
grpcurl -insecure provider.akashtesting.xyz:8444 akash.provider.v1.ProviderRPC.GetStatus
```
{
  "cluster": {
    "leases": {},
    "inventory": {
      "cluster": {
        "nodes": [
          {
            "name": "node1",
            "resources": {
              "cpu": {
                "quantity": {
                  "allocatable": {
                    "string": "8"
                  },
                  "allocated": {
                    "string": "3720m"
                  }
                },
                "info": [
                  {
                    "id": "0",
                    "vendor": "GenuineIntel",
                    "model": "Intel(R) Xeon(R) CPU @ 2.20GHz",
                    "vcores": 8
                  }
                ]
              },
              "memory": {
                "quantity": {
                  "allocatable": {
                    "string": "33538080768"
                  },
                  "allocated": {
                    "string": "4535332Ki"
                  }
                }
              },
              "gpu": {
                "quantity": {
                  "allocatable": {
                    "string": "0"
                  },
                  "allocated": {
                    "string": "0"
                  }
                }
              },
              "ephemeralStorage": {
                "allocatable": {
                  "string": "233966001789"
                },
                "allocated": {
                  "string": "0"
                }
              },
              "volumesAttached": {
                "allocatable": {
                  "string": "0"
                },
                "allocated": {
                  "string": "0"
                }
              },
              "volumesMounted": {
                "allocatable": {
                  "string": "0"
                },
                "allocated": {
                  "string": "0"
                }
              }
            },
            "capabilities": {
              "storageClasses": [
                "beta2"
              ]
            }
          },
          {
            "name": "node2",
            "resources": {
              "cpu": {
                "quantity": {
                  "allocatable": {
                    "string": "8"
                  },
                  "allocated": {
                    "string": "4205m"
                  }
                },
                "info": [
                  {
                    "id": "0",
                    "vendor": "GenuineIntel",
                    "model": "Intel(R) Xeon(R) CPU @ 2.30GHz",
                    "vcores": 8
                  }
                ]
              },
              "memory": {
                "quantity": {
                  "allocatable": {
                    "string": "31424155648"
                  },
                  "allocated": {
                    "string": "7715418Ki"
                  }
                }
              },
              "gpu": {
                "quantity": {
                  "allocatable": {
                    "string": "1"
                  },
                  "allocated": {
                    "string": "1"
                  }
                },
                "info": [
                  {
                    "vendor": "nvidia",
                    "name": "t4",
                    "modelid": "1eb8",
                    "interface": "PCIe",
                    "memorySize": "16Gi"
                  }
                ]
              },
              "ephemeralStorage": {
                "allocatable": {
                  "string": "233966001789"
                },
                "allocated": {
                  "string": "268435456"
                }
              },
              "volumesAttached": {
                "allocatable": {
                  "string": "0"
                },
                "allocated": {
                  "string": "0"
                }
              },
              "volumesMounted": {
                "allocatable": {
                  "string": "0"
                },
                "allocated": {
                  "string": "0"
                }
              }
            },
            "capabilities": {
              "storageClasses": [
                "beta2"
              ]
            }
          },
          {
            "name": "node3",
            "resources": {
              "cpu": {
                "quantity": {
                  "allocatable": {
                    "string": "8"
                  },
                  "allocated": {
                    "string": "5875m"
                  }
                },
                "info": [
                  {
                    "id": "0",
                    "vendor": "GenuineIntel",
                    "model": "Intel(R) Xeon(R) CPU @ 2.20GHz",
                    "vcores": 8
                  }
                ]
              },
              "memory": {
                "quantity": {
                  "allocatable": {
                    "string": "33538080768"
                  },
                  "allocated": {
                    "string": "13674038Ki"
                  }
                }
              },
              "gpu": {
                "quantity": {
                  "allocatable": {
                    "string": "0"
                  },
                  "allocated": {
                    "string": "0"
                  }
                }
              },
              "ephemeralStorage": {
                "allocatable": {
                  "string": "233966001789"
                },
                "allocated": {
                  "string": "0"
                }
              },
              "volumesAttached": {
                "allocatable": {
                  "string": "0"
                },
                "allocated": {
                  "string": "0"
                }
              },
              "volumesMounted": {
                "allocatable": {
                  "string": "0"
                },
                "allocated": {
                  "string": "0"
                }
              }
            },
            "capabilities": {
              "storageClasses": [
                "beta2"
              ]
            }
          }
        ],
        "storage": [
          {
            "quantity": {
              "allocatable": {
                "string": "101796855808"
              },
              "allocated": {
                "string": "0"
              }
            },
            "info": {
              "class": "beta2"
            }
          }
        ]
      },
      "reservations": {
        "pending": {
          "resources": {
            "cpu": {
              "string": "0"
            },
            "memory": {
              "string": "0"
            },
            "gpu": {
              "string": "0"
            },
            "ephemeralStorage": {
              "string": "0"
            }
          }
        },
        "active": {
          "resources": {
            "cpu": {
              "string": "0"
            },
            "memory": {
              "string": "0"
            },
            "gpu": {
              "string": "0"
            },
            "ephemeralStorage": {
              "string": "0"
            }
          }
        }
      }
    }
  },
  "bidEngine": {},
  "manifest": {},
  "publicHostnames": [
    "provider.akashtestprovider.xyz"
  ],
  "timestamp": "2024-02-16T17:20:20.054534655Z"
}
````
