---
categories: ["Other Resources", "Archived Resources"]
tags: []
weight: 2
title: "Akash Provider Feature Discovery Upgrade/Enablement"
linkTitle: "Akash Provider Feature Discovery Upgrade/Enablement"
---

> _**NOTE**_ - do NOT use these instructions until they have been migrated out of experimental and the Akash core team has communicated it is safe to execute.

The following provides an overview of the steps necessary to upgrade your Akash provider to version `0.5.0` and to enable Feature Discovery:

- [Download Helm Chart and Use Feature Discovery Branch](#download-helm-chart-and-use-feature-discovery-branch)
  - [Clone Akash Helm Chart Repository](#clone-akash-helm-chart-repository)
  - [Checkout Feature Discovery Branch of Helm Chart Repo](#checkout-feature-discovery-branch-of-helm-chart-repo)
  - [Expected Output](#expected-output)
- [Akash Hostname Operator Upgrade](#akash-hostname-operator-upgrade)
- [Akash Provider Upgrade](#akash-provider-upgrade)
- [Akash IP Operator Upgrade (If Applicable)](#akash-ip-operator-upgrade-if-applicable)
- [Akash Inventory Operator Install/Upgrade](#akash-inventory-operator-installupgrade)
  - [STEP 1](#step-1)
  - [STEP 2](#step-2)
  - [STEP 3](#step-3)
- [Update Ingress Controller](#update-ingress-controller)
- [Verifications](#verifications)
  - [Example/Expected Output](#exampleexpected-output)
- [Testing](#testing)
  - [Template](#template)
  - [Example/Expected Output](#exampleexpected-output-1)

> _**NOTE**_ - complete the steps in this guide in the order presented

### Download Helm Chart and Use Feature Discovery Branch

#### Clone Akash Helm Chart Repository

```
cd ~

git clone https://github.com/akash-network/helm-charts.git
```

#### Checkout Feature Discovery Branch of Helm Chart Repo

```
cd ~/helm-charts

helm repo update

git checkout feature-discovery

### Ensure the working branch has been updated to feature-discovery
git branch
```

#### Expected Output

```
git checkout feature-discovery
Branch 'feature-discovery' set up to track remote branch 'feature-discovery' from 'origin'.
Switched to a new branch 'feature-discovery'

git branch
* feature-discovery
  main
```

### Akash Hostname Operator Upgrade

```
cd ~/helm-charts/charts/akash-hostname-operator

helm uninstall akash-hostname-operator -n akash-services

helm package .

helm install akash-hostname-operator akash-hostname-operator-9.0.0.tgz -n akash-services --set image.tag=0.5.0
```

### Akash Provider Upgrade

> _**NOTE**_ - these instructions assume your Akash Provider settings are stored in `/root/provider/provider.yaml`. If this is not the cause - dump current provider settings prior to initiating this process via the following command and ensure the `helm install` command points to the location of this file.\
> \
> `helm -n akash-services get values akash-provider > provider.yaml`

> _**NOTE**_ - provider GPU attributes must now adhere to the naming conventions in this [JSON file](https://github.com/akash-network/provider-configs/blob/main/devices/pcie/gpus.json). Your attributes may need to be updated to follow these standards. If your provider attributes do not adhere to the naming conventions in this JSON file it may not bid when specific models are included in the SDL.

> _**NOTE**_ - if your provider uses a custom price script - ensure to add pointer to that script in the `helm install` command such as the following. Note that this syntax assumes the pricing script resides in the `/root/provider` directory.\
> \
> `--set bidpricescript="$(cat /root/provider/price_script_generic.sh | openssl base64 -A)"`

```
cd ~/helm-charts/charts/akash-provider

helm uninstall akash-provider -n akash-services

helm package .

helm install akash-provider provider-9.0.0.tgz -n akash-services -f /root/provider/provider.yaml --set image.tag=0.5.0
```

### Akash IP Operator Upgrade (If Applicable)

> _**NOTE**_ - the IP Operator is only necessary if your Akash Provider provides IP Leases

```
cd ~/helm-charts/charts/akash-ip-operator

helm uninstall akash-ip-operator -n akash-services

helm package .

### Update the `<provider-address>` placeholder with the address of your provider
helm install akash-ip-operator akash-ip-operator-9.0.0.tgz -n akash-services --set provider_address=<provider-address> --set image.tag=0.5.0
```

### Akash Inventory Operator Install/Upgrade

> _**NOTE**_ - the Inventory Operator is now required on ALL Akash Providers. Previously this operator was only required when the Provider hosted persistent storage. But the operator is now mandated on all providers.

> _**NOTE**_ - if your provider hosts persistent storage, ensure that the CEPH cluster is in a healthy state prior to upgrading the Akash Inventory Operator

#### STEP 1

> _**NOTE**_ - if you do not have a prior installation of the inventory operator the uninstall command will produce an error. Disregard the error and proceed to next step.

```
helm uninstall inventory-operator -n akash-services
```

#### STEP 2

> _**NOTE**_ - this step is only necessary for providers hosting persistent storage

```
cd ~/helm-charts/charts/akash-inventory-operator

vi values.yaml
```

Within the `values.yaml` file ensure that the `inventoryConfig` section is updated with your persistent storage type - I.e. `beta1`, `beta2`, or `beta3`.&#x20;

```
inventoryConfig:
  # Allow users to specify cluster storage options
  cluster_storage:
    - default
    - beta2
```

#### STEP 3

```
cd ~/helm-charts/charts/akash-inventory-operator

helm package .

helm install inventory-operator akash-inventory-operator-9.0.0.tgz -n akash-services --set image.tag=0.5.0

```

### Update Ingress Controller

> _**NOTE**_ - this step must be completed by all providers to expose the Feature Discovery gRPC port

> _**NOTE**_ - ensure to open port `8444` on your firewall if necessary as well


The Ingress Controller rules have been updated to include Feature Discovery destinations and mainly port `8444`. Update your ingress controller to ensure they are current via the instructions in this doc [section](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/#step-10---ingress-controller-install).


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
grpcurl -insecure <PROVIDER-IP-ADDRESS>:8444 akash.provider.v1.ProviderRPC.GetStatus
```

#### Example/Expected Output

```
grpcurl -insecure 34.28.236.4:8444 akash.provider.v1.ProviderRPC.GetStatus
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
```
