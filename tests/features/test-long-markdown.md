---
id: fengOptimalGradientCheckpoint2021
title: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
type: literature
aliases:
  - fengOptimalGradientCheckpoint2021
  - Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs  -Jianwei Feng, Dong Huang(2021)
year: 2021-06-01
tags:
  - software/Zotero
  - content/paper
---
#software/Zotero/concept/computational-graph #software/Zotero/metric/runtime  #software/Zotero/direction/performance-optimization  #software/Zotero/topic/model-training  #software/Zotero/direction/machine-learning  #software/Zotero/topic/memory-management  #software/Zotero/context/convolutional-neural-network  #software/Zotero/problem/searching-algorithm-inefficient  #software/Zotero/topic/graident-checkpointing  #software/Zotero/venue/conference/cvpr   #year/2021 #research/author/Jianwei-Feng   #research/author/Dong-Huang   

# Abstract


> [!info]+ Metadata
> title:: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
> authors:: Jianwei Feng, Dong Huang
> first-entry:: 2025-10-13#11:15:10
> last-entry:: 2025-10-13#20:44:26
> online-uri:: http://zotero.org/users/9976925/items/4CT5F5MI
> bibliography:: Feng, J., & Huang, D. (2021). Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs. _2021 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)_, 11428–11437. [https://doi.org/10.1109/CVPR46437.2021.01127](https://doi.org/10.1109/CVPR46437.2021.01127)
> pdf:: [Submitted Version](zotero://select/library/items/F6QP97W8)
> year:: 2021
> date:: 2021-06-01
> citekey:: fengOptimalGradientCheckpoint2021
> itemtype:: conferencePaper
> url:: https://ieeexplore.ieee.org/document/9577960/

🔥🔥🔥everything above this line might change during an update 🔥🔥🔥
%% begin notes %%
⬇️*Imported (Notes) on: 2025-10-13#20:48:31*⬇️



## 🟨 Note (modified: 2025-10-13#20:44:10)
💊**TL;DR**:: This paper introduces the first optimal gradient checkpointing algorithm for arbitrary computation graphs, enabling up to 80% training memory reduction with a moderate time overhead by decomposing the graph and recursively finding the best checkpoints. 🩻**topic**:: This work focuses on optimizing the memory consumption during the training of deep neural networks on GPUs. 🧬**position**:: The paper argues that existing gradient checkpointing methods are suboptimal and limited to linear or specific graph structures, and proposes a universally applicable and optimal solution for arbitrary computation graphs. ✅**contributions**:: The key contributions include a novel formulation for optimal checkpointing on arbitrary graphs, a graph decomposition theory based on "Independent Segments" to create a unique "Division Tree," and an efficient solver that recursively finds the optimal checkpoints. 🫆**method**:: The method involves modeling the network as an arbitrary computation graph, recursively decomposing it into a tree of independent segments, and using a dynamic programming-like approach on this tree to solve for the set of checkpoints that minimizes peak memory usage. 💎**novelty**:: **The primary novelty is the development of a theoretical framework and a practical algorithm that finds the provably optimal set of gradient checkpoints for any arbitrary (non-linear) computation graph**, a problem previously unsolved by heuristic or linear-only approaches. 🌡️**evaluation**:: The proposed algorithm is evaluated on a wide range of linear (VGG) and non-linear (ResNet, DenseNet, NAS-based) networks, demonstrating superior memory savings (up to 85%) compared to prior art and random baselines, with acceptable time overheads (around 30-50%). 📌**limitation**:: The paper notes the algorithm introduces a time overhead of 30-50% due to recomputation , and the one-time preprocessing step to find the optimal checkpoints can be computationally intensive for extremely large graphs.
[Link to note](http://zotero.org/users/9976925/items/U57WKDI6)


---



## 🟨 Note (modified: 2025-10-13#20:44:26)

##### Research Storyline

1. **Introduce Background**: Training modern Deep Neural Networks (DNNs), such as ResNet [14] and DenseNet [15], requires an enormous amount of GPU memory, which grows quadratically with input size and network depth.
    
2. **Introduce Problem**: This high memory demand creates a significant bottleneck, physically limiting the model complexity, input resolution, and batch sizes that can be used on existing hardware, thereby hindering performance improvements.
    
3. **Introduce Challenge**: While Gradient CheckPointing (GCP) is a known technique to trade computation for memory, existing automatic solutions like that of Chen et al. [8] are heuristic and only work for simple Linear Computation Graphs (LCGs). Provably optimal algorithms were either confined to very specific cases, like linear graphs with uniform costs [11] or specific architectures like RNNs [12], leaving the vast majority of modern networks with Arbitrary Computation Graphs (ACGs) without an optimal solution.
    
4. **Point out Core Insight**: The authors propose the core insight that any complex, arbitrary computation graph can be uniquely and hierarchically decomposed into a tree structure of "Independent Segments," which transforms the intractable global optimization problem into a series of smaller, manageable subproblems.
    
5. **Propose Solution**: Based on this insight, they develop a novel algorithm that first builds this unique "Division Tree" for a given network graph and then recursively solves for the optimal set of gradient checkpoints, providing the first universally applicable and provably optimal memory-saving solution for training any DNN.
[Link to note](http://zotero.org/users/9976925/items/ST7DHXLS)
#software/Zotero/cat/research-story  

---

%% end notes %% 
%% begin annotations %%
 
 
⬇️*Imported (Annotations) on 2025-10-13#12:36:34*⬇️

## 🏷️ Background Info

### Annotation ID - YBM8386P
Auto Tags:  #research/background

````ad-academic-anno-background
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 
*note date*: 2025-10-13 11:15

Unfortunately, the GPU memory is physically finite, which limits the image resolutions and batch sizes that could be used in training for better DNN performance. Unlike solutions that require physically upgrade GPUs, the Gradient CheckPointing(GCP) training trades computation for more memory beyond existing GPU hardware.(p. [](zotero://open-pdf/library/items/F6QP97W8?page=&annotation=YBM8386P))
````

### Annotation ID - G2338XU6
Auto Tags:  #research/background
#software/Zotero/problem/out-of-memory  #software/Zotero/problem/gpu-memory-wall   


````ad-academic-anno-background
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 2
*note date*: 2025-10-13 11:47

Existing efforts to address memory issues presented three main approaches: (1) Better single GPUs. Recent GPUs provide larger memory at the expense of exponentially growing price and power consumption. For instance, from TitanXp, Quadro P6000, RTX 3090 to Tesla V100, for 1-2.7 times increase in memory, the prices increase 2.8-8.5 times. (2) Parallelization among multiple GPUs [10, 27, 18, 21, 20, 34, 2, 3], which requires expensive clusters, introduces substantial I/O cost, and does not reduce the total memory cost. (3) Gradient CheckPointing (GCP) [8, 12], which focuses on trading computation for memory and reduces the total memory cost without any upgrade in hardware. Note that recent affordable GPUs (e.g., RTX 2080 Ti , RTX 3080), although limited in memory (around 11GB), provide exceptional improvement in GPU cores and FLOPS. Trading computation costs for memory is a very attractive solution that make it possible to train very heavy DNNs with finite GPU memory.(p. [2](zotero://open-pdf/library/items/F6QP97W8?page=2&annotation=G2338XU6)) 
```ad-comments
title: Existing Approaches for OOM<br />
<br />
1. Increasing capacity of GPU<br />
2. Parallelization of a single training task on multiple-GPUs<br />
3. Gradient CheckPointing
```

````

### Annotation ID - B57YM3VW
Auto Tags:  #research/background
#software/Zotero/method/tensor-liveness-analysis


````ad-academic-anno-background
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 2
*note date*: 2025-10-13 12:10

Liveness analysis recycles garbage to manage memory. These ideas were originated from compiler optimization [4] and has been widely adopted by deep learning frameworks: Theano [5, 6], MXNet [7], Tensorflow [1] and CNTK [33].(p. [2](zotero://open-pdf/library/items/F6QP97W8?page=2&annotation=B57YM3VW))
````


## 🏷️ Disagree/Limitation/Concern

### Annotation ID - J9KKU39Z
Auto Tags:  #research/problem

````ad-academic-anno-caution
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 
*note date*: 2025-10-13 11:26

Existing GCP approaches rely on either manual input of GCs or heuristics-based GC search on Linear Computation Graphs (LCGs), and cannot apply to Arbitrary Computation Graphs(ACGs).(p. [](zotero://open-pdf/library/items/F6QP97W8?page=&annotation=J9KKU39Z))
````

### Annotation ID - G3J59F9T
Auto Tags:  #research/problem

````ad-academic-anno-caution
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 8
*note date*: 2025-10-13 11:29

Automatic Gradient Checkpoint(GC) searching is the key to GCP, whereas existing efforts are stagnant at heuristic GC searching and LCGs.(p. [8](zotero://open-pdf/library/items/F6QP97W8?page=8&annotation=G3J59F9T))
````


## 🏷️ Hypothesis Supporting

### Annotation ID - 6Z7BX5IS
Auto Tags:  #research/hypothesis

````ad-academic-anno-hypothesis
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 
*note date*: 2025-10-13 11:26

The total training memory cost becomes the sum of (1) the memory cost of the gradient checkpoints and (2) the maximum memory cost of local forwards. To achieve maximal memory cut-offs, one needs optimal algorithms to select GCs.(p. [](zotero://open-pdf/library/items/F6QP97W8?page=&annotation=6Z7BX5IS))
````

### Annotation ID - 9GHVQE2B
Auto Tags:  #research/hypothesis

````ad-academic-anno-hypothesis
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 2
*note date*: 2025-10-13 12:06

The GC searching algorithm is a preprocessing step of GCP training, and only needs to be run once for  one computation graph.(p. [2](zotero://open-pdf/library/items/F6QP97W8?page=2&annotation=9GHVQE2B))
````




## 🏷️ Experiment Related

### Annotation ID - J668ZTEB
Auto Tags:  #research/experiment

````ad-academic-anno-data
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 
*note date*: 2025-10-13 11:34

Our work enables GCP training on ACGs, and cuts off up-to 80% of training memory1 with a moderate time overhead (∼ 30%-50%). Codes are available2.(p. [](zotero://open-pdf/library/items/F6QP97W8?page=&annotation=J668ZTEB))
````

### Annotation ID - 8F9XXF6D
Auto Tags:  #research/experiment

````ad-academic-anno-data
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 2
*note date*: 2025-10-13 12:07

Using our GC searching algorithm, the GCP training can accommodate much larger models, on the same physical GPU memory (see the table in Fig. 1). For instance, on 4 RTX2080Ti GPUs, regular training can typically train a ResNet50 image classification model of 3 × 224 × 224 input size with 256 batch size.(p. [2](zotero://open-pdf/library/items/F6QP97W8?page=2&annotation=8F9XXF6D))
````


## 🏷️ Vocabulary

### Annotation ID - YSYW548J
Auto Tags:  #vocabulary
#software/Zotero/cat/terms


````ad-academic-anno-vocabulary
*article*: Optimal Gradient Checkpoint Search for Arbitrary Computation Graphs
*year*: 2021
*page*: 2
*note date*: 2025-10-13 12:07

[[Arbitrary Computation Graphs(ACG)]](p. [2](zotero://open-pdf/library/items/F6QP97W8?page=2&annotation=YSYW548J))
````







%% end annotations %%

%% Import Date: 2025-10-13T20:48:34.761+01:00 %%