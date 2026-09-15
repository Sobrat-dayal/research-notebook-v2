import { PresetPaper, PaperSummary } from '../types';

export const PRESET_PAPERS: PresetPaper[] = [
  {
    id: 'transformer-2017',
    title: 'Attention Is All You Need',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin',
    year: '2017',
    field: 'Artificial Intelligence / NLP',
    badge: 'Seminal Landmark Paper',
    abstractSnippet: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a model architecture relying entirely on attention mechanisms to draw global dependencies between input and output.',
    fullText: `Attention Is All You Need. Ashish Vaswani et al. Google Brain / Google Research.
    The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.
    On the WMT 2014 English-to-German translation task, the transformer model achieves 28.4 BLEU, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on 8 GPUs.`,
    preCalculatedSummary: {
      title: 'Attention Is All You Need',
      authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
      institution: 'Google Brain & Google Research',
      publicationYear: '2017',
      field: 'Deep Learning & Natural Language Processing',
      tldr: 'Replaced recurrent neural networks (RNNs) with a purely self-attention based architecture (Transformer), enabling massive parallel training and powering modern LLMs.',
      executiveSummary: 'This paper introduced the Transformer architecture, completely replacing recurrent neural networks (RNNs) and convolutional networks (CNNs) in sequence-to-sequence modeling tasks. By utilizing multi-head self-attention, the Transformer computes global dependencies across token sequences in constant time steps, bypassing sequential bottlenecking.\n\nThe results demonstrated superior performance on machine translation (WMT 2014 English-German and English-French) while requiring a fraction of the computational training cost. The Transformer architecture serves as the core foundation for virtually all modern Generative AI models including GPT-4, Gemini, and Claude.',
      keyTakeaways: [
        {
          category: 'Innovation',
          title: 'Pure Self-Attention Mechanism',
          description: 'Eliminates recurrence completely. Token relationships are calculated in parallel via Query, Key, and Value matrix multiplications.'
        },
        {
          category: 'Methodology',
          title: 'Multi-Head Attention & Positional Encoding',
          description: 'Allows the model to jointly attend to information from different representation subspaces at different positions, supplemented by sinusoidal positional encodings.'
        },
        {
          category: 'Finding',
          title: 'Superior BLEU Scores with Lower Compute',
          description: 'Achieved 28.4 BLEU on En-De (a 2.0+ BLEU increase) and 41.8 BLEU on En-Fr while cutting training time by over 75% compared to ConvS2S and GNMT.'
        },
        {
          category: 'Impact',
          title: 'Foundation of Modern Generative AI',
          description: 'Unblocked massively scalable parallel pretraining on internet-scale text datasets, spawning BERT, GPT, T5, and state-of-the-art LLMs.'
        }
      ],
      actionableInsights: [
        {
          targetAudience: 'Engineers & Developers',
          recommendation: 'Prioritize Transformer-based backbones over RNN/LSTM architectures for sequence processing due to superior GPU parallelization.',
          impactLevel: 'Critical'
        },
        {
          targetAudience: 'Researchers',
          recommendation: 'Explore positional embedding variations (e.g., Rotary Position Embeddings / RoPE, ALiBi) for long-context sequence windows.',
          impactLevel: 'High'
        },
        {
          targetAudience: 'Product & Business',
          recommendation: 'Leverage Transformer models for multi-lingual automation, contextual search indexing, and real-time document summarization.',
          impactLevel: 'High'
        }
      ],
      keyMetrics: [
        { label: 'WMT 2014 En-De BLEU', value: '28.4', baseline: '26.3', improvement: '+2.1 BLEU', description: 'New SOTA BLEU score over state-of-the-art ensemble models' },
        { label: 'WMT 2014 En-Fr BLEU', value: '41.8', baseline: '41.0', improvement: '+0.8 BLEU', description: 'Single-model SOTA translation quality' },
        { label: 'Training FLOPS Cost', value: '3.3x10^18', baseline: '1.2x10^19', improvement: '-72.5% Compute', description: 'Dramatically reduced compute budget required to reach peak accuracy' },
        { label: 'Training Time', value: '12 Hours', baseline: '84 Hours', improvement: '7x Faster', description: 'Trained on 8 Nvidia P100 GPUs' }
      ],
      pipelineSteps: [
        { stepNumber: 1, name: 'Input Embedding & Positional Encoding', description: 'Convert tokens to vector space and inject sinusoidal position signals.', keyTechnique: 'Sinusoidal Positional Encoding' },
        { stepNumber: 2, name: 'Multi-Head Self-Attention', description: 'Project queries, keys, and values across h attention heads to capture multi-faceted relationships.', keyTechnique: 'Scaled Dot-Product Attention' },
        { stepNumber: 3, name: 'Residual Connection & LayerNorm', description: 'Add residual skip connections followed by layer normalization.', keyTechnique: 'LayerNorm(X + Sublayer(X))' },
        { stepNumber: 4, name: 'Position-wise Feed-Forward Network', description: 'Apply non-linear dense layers independently to each position.', keyTechnique: 'Two Linear Transformations + ReLU' },
        { stepNumber: 5, name: 'Autoregressive Decoding & Softmax', description: 'Decoder generates target tokens sequentially with masked attention.', keyTechnique: 'Masked Scaled Dot-Product' }
      ],
      charts: [
        {
          id: 'bleu-comparison',
          chartTitle: 'Translation Quality (BLEU Score) Comparison',
          chartType: 'bar',
          xAxisLabel: 'Model Architecture',
          yAxisLabel: 'BLEU Score (Higher is Better)',
          description: 'Comparing Transformer (Base & Big) against previous SOTA RNN (GNMT) and CNN (ConvS2S) architectures on WMT 2014 benchmarks.',
          dataKeys: ['En_De_BLEU', 'En_Fr_BLEU'],
          data: [
            { name: 'GNMT + RL', En_De_BLEU: 24.6, En_Fr_BLEU: 39.9 },
            { name: 'ConvS2S Ensemble', En_De_BLEU: 26.3, En_Fr_BLEU: 41.2 },
            { name: 'Transformer (Base)', En_De_BLEU: 27.3, En_Fr_BLEU: 38.1 },
            { name: 'Transformer (Big)', En_De_BLEU: 28.4, En_Fr_BLEU: 41.8 }
          ]
        },
        {
          id: 'training-cost',
          chartTitle: 'Training Computational Efficiency (10^18 FLOPs)',
          chartType: 'line',
          xAxisLabel: 'Model',
          yAxisLabel: 'Total Training Cost (Lower is Better)',
          description: 'Transformer Big achieves SOTA results using less than a third of the training FLOPs compared to state-of-the-art recurrent models.',
          dataKeys: ['FLOPs_1e18'],
          data: [
            { name: 'ByteNet', FLOPs_1e18: 9.5 },
            { name: 'Deep-Att', FLOPs_1e18: 20.0 },
            { name: 'GNMT + RL', FLOPs_1e18: 18.0 },
            { name: 'ConvS2S', FLOPs_1e18: 9.6 },
            { name: 'Transformer (Big)', FLOPs_1e18: 3.3 }
          ]
        },
        {
          id: 'architecture-head-weights',
          chartTitle: 'Attention Head Capacity Radar Profile',
          chartType: 'radar',
          xAxisLabel: 'Capability Metric',
          yAxisLabel: 'Relative Score',
          description: 'Evaluating architectural strengths across multi-head attention capabilities.',
          dataKeys: ['Transformer', 'RNN_LSTM'],
          data: [
            { name: 'Parallel Training', Transformer: 98, RNN_LSTM: 25 },
            { name: 'Long-Range Context', Transformer: 92, RNN_LSTM: 40 },
            { name: 'Compute Efficiency', Transformer: 95, RNN_LSTM: 35 },
            { name: 'Translation Accuracy', Transformer: 96, RNN_LSTM: 78 },
            { name: 'Sequential Dependency', Transformer: 15, RNN_LSTM: 95 }
          ]
        }
      ],
      glossary: [
        { term: 'Self-Attention', definition: 'An attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence.' },
        { term: 'Multi-Head Attention', definition: 'Running the attention mechanism multiple times in parallel with different linear projections to capture varied context features.' },
        { term: 'Positional Encoding', definition: 'Vectors added to token embeddings to supply order information that self-attention inherently lacks.' }
      ],
      topics: [
        { id: 't1', topicName: 'Scaled Dot-Product Attention', category: 'Core Architecture', shortSummary: 'Computes Query-Key dot products scaled by square root of head dimension.' },
        { id: 't2', topicName: 'Multi-Head Attention Mechanism', category: 'Core Architecture', shortSummary: 'Splits embeddings into multiple subspace projections processed in parallel.' },
        { id: 't3', topicName: 'Sinusoidal Positional Encodings', category: 'Sequence Representation', shortSummary: 'Injects relative token position signals using sine and cosine functions.' },
        { id: 't4', topicName: 'Encoder-Decoder Skip Connections', category: 'Optimization', shortSummary: 'Uses residual connections and LayerNorm around each self-attention block.' },
        { id: 't5', topicName: 'WMT 2014 Benchmark Results', category: 'Empirical Evaluation', shortSummary: 'Set new SOTA BLEU scores of 28.4 (En-De) and 41.8 (En-Fr) with 75% lower compute.' }
      ],
      references: [
        { id: 'r1', authors: 'Bahdanau, D., Cho, K., & Bengio, Y.', title: 'Neural machine translation by jointly learning to align and translate', venue: 'ICLR 2015', year: '2015', url: 'https://arxiv.org/abs/1409.0473', doi: '10.48550/arXiv.1409.0473' },
        { id: 'r2', authors: 'Gehring, J., Auli, M., Grangier, D., Yarats, D., & Dauphin, Y. N.', title: 'Convolutional sequence to sequence learning', venue: 'ICML 2017', year: '2017', url: 'https://arxiv.org/abs/1705.03122', doi: '10.48550/arXiv.1705.03122' },
        { id: 'r3', authors: 'Wu, Y., Schuster, M., Chen, Z., Le, Q. V., Norouzi, M., et al.', title: 'Google\'s neural machine translation system: Bridging the gap between human and machine translation', venue: 'arXiv preprint', year: '2016', url: 'https://arxiv.org/abs/1609.08144', doi: '10.48550/arXiv.1609.08144' },
        { id: 'r4', authors: 'Sutskever, I., Vinyals, O., & Le, Q. V.', title: 'Sequence to sequence learning with neural networks', venue: 'NeurIPS 2014', year: '2014', url: 'https://arxiv.org/abs/1409.3215', doi: '10.48550/arXiv.1409.3215' }
      ],
      citation: 'Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention is all you need. Advances in Neural Information Processing Systems (NeurIPS 2017), 30.',
      formulas: [
        {
          id: 'scaled-dot-product',
          name: 'Scaled Dot-Product Attention',
          latex: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V',
          description: 'Calculates affinity matrix between queries and keys, scales by root head dimension, normalizes via softmax, and produces weighted sum over values.',
          variables: [
            { symbol: 'Q', meaning: 'Query Matrix', intuition: 'Represents the current token probing for context in other tokens.', dimensions: 'n \\times d_k' },
            { symbol: 'K', meaning: 'Key Matrix', intuition: 'Represents every token offering its semantic features to be queried.', dimensions: 'm \\times d_k' },
            { symbol: 'V', meaning: 'Value Matrix', intuition: 'The factual information extracted once an attention weight match is made.', dimensions: 'm \\times d_v' },
            { symbol: 'd_k', meaning: 'Key Dimension', intuition: 'Scaling factor prevents inner products from growing excessively large for deep dimensions, preventing vanishing softmax gradients.', dimensions: '\\text{Scalar (e.g. 64)}' }
          ]
        },
        {
          id: 'multi-head-attention',
          name: 'Multi-Head Attention Projection',
          latex: '\\text{MultiHead}(Q,K,V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O',
          description: 'Linearly projects queries, keys, and values h times into distinct representation subspaces, enabling the model to jointly attend to diverse semantic roles.',
          variables: [
            { symbol: 'h', meaning: 'Number of Heads', intuition: 'Number of distinct geometric sub-perspectives (e.g., 8 heads in Base Transformer).', dimensions: '\\text{Integer (8 or 16)}' },
            { symbol: '\\text{head}_i', meaning: 'Individual Head Attention', intuition: '\\text{Attention}(Q W_i^Q, K W_i^K, V W_i^V)', dimensions: 'n \\times d_v' },
            { symbol: 'W^O', meaning: 'Output Projection Matrix', intuition: 'Aggregates outputs from all parallel heads back into the model dimension.', dimensions: 'h d_v \\times d_{model}' }
          ]
        },
        {
          id: 'positional-encoding',
          name: 'Sinusoidal Positional Encoding',
          latex: 'PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right), \\quad PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)',
          description: 'Supplies absolute and relative sequence order signals to embeddings since pure dot-product attention is permutation-invariant.',
          variables: [
            { symbol: 'pos', meaning: 'Token Sequence Position', intuition: 'Discrete integer index of the word token along the sequence axis (0, 1, 2, ...).', dimensions: '\\text{Scalar Index}' },
            { symbol: 'i', meaning: 'Embedding Dimension Index', intuition: 'Cycles through geometric frequencies from high frequency (small i) to low frequency (large i).', dimensions: '0 \\le i < d_{\\text{model}}/2' },
            { symbol: 'd_{\\text{model}}', meaning: 'Model Hidden Size', intuition: 'Total embedding dimension (e.g. 512 for base transformer).', dimensions: '\\text{Integer (512)}' }
          ]
        }
      ],
      citationNodes: [
        { id: 'c1', title: 'Neural Machine Translation by Jointly Learning to Align and Translate', authors: 'Bahdanau et al.', year: '2014', citationsCount: 38400, type: 'foundation', relevanceScore: 98, keyContribution: 'First introduced the soft attention mechanism for RNN seq2seq models.' },
        { id: 'c2', title: 'Convolutional Sequence to Sequence Learning', authors: 'Gehring et al. (ConvS2S)', year: '2017', citationsCount: 5200, type: 'competitor', relevanceScore: 88, keyContribution: 'Prior state-of-the-art that used CNNs instead of RNNs for faster parallel translation.' },
        { id: 'c3', title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: '2017', citationsCount: 145000, type: 'target', relevanceScore: 100, keyContribution: 'Introduced pure self-attention Transformer without recurrence.' },
        { id: 'c4', title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin et al.', year: '2018', citationsCount: 110000, type: 'descendant', relevanceScore: 99, keyContribution: 'Adapted Transformer encoder for masked language modeling pretraining.' },
        { id: 'c5', title: 'Language Models are Few-Shot Learners (GPT-3)', authors: 'Brown et al.', year: '2020', citationsCount: 65000, type: 'descendant', relevanceScore: 97, keyContribution: 'Scaled autoregressive Transformer decoders to 175B parameters.' },
        { id: 'c6', title: 'FlashAttention: Fast and Memory-Efficient Exact Attention', authors: 'Dao et al.', year: '2022', citationsCount: 4200, type: 'descendant', relevanceScore: 94, keyContribution: 'IO-aware GPU tiling optimization solving quadratic memory overhead.' }
      ]
    }
  },
  {
    id: 'resnet-2015',
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun',
    year: '2015',
    field: 'Computer Vision & Deep Learning',
    badge: 'CVPR Best Paper',
    abstractSnippet: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs.',
    fullText: `Deep Residual Learning for Image Recognition. Kaiming He et al. Microsoft Research.
    Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset we evaluate residual nets with a depth of up to 152 layers—8x deeper than VGG nets but still having lower complexity. An ensemble of these residual nets achieves 3.57% error on the ImageNet test set. This result won 1st place on the ILSVRC 2015 classification task.`,
    preCalculatedSummary: {
      title: 'Deep Residual Learning for Image Recognition (ResNet)',
      authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
      institution: 'Microsoft Research',
      publicationYear: '2015',
      field: 'Computer Vision & Convolutional Neural Networks',
      tldr: 'Solved the vanishing/exploding gradient problem in extremely deep neural networks using residual skip connections (shortcut connections).',
      executiveSummary: 'This landmark computer vision paper addressed the paradox where deeper neural networks suffered from degraded training accuracy despite higher capacity. The authors introduced Residual Networks (ResNet), which use identity shortcut connections to learn residual mappings F(x) = H(x) - x rather than direct mappings H(x).\n\nBy ensuring information flow through identity shortcuts, ResNet enabled training networks up to 152 layers deep—8x deeper than VGG—while maintaining lower computational complexity and winning 1st place in all ILSVRC & COCO 2015 challenges with a historic 3.57% top-5 error rate.',
      keyTakeaways: [
        {
          category: 'Innovation',
          title: 'Identity Shortcut Connections',
          description: 'Allows gradients to flow directly back through shortcut connections without attenuation, solving degradation in deep nets.'
        },
        {
          category: 'Methodology',
          title: 'Bottleneck Architecture',
          description: 'Used 1x1, 3x3, and 1x1 convolutions to reduce computational dimensions before spatial processing in deeper variants (ResNet-50/101/152).'
        },
        {
          category: 'Finding',
          title: 'Accuracy Scales with Depth',
          description: 'ResNet-152 achieved 3.57% top-5 error on ImageNet, outperforming humans and all prior architectures.'
        },
        {
          category: 'Impact',
          title: 'Universal Backbone for Visual AI',
          description: 'Became the fundamental feature extraction backbone for object detection, segmentation, medical imaging, and multimodal models.'
        }
      ],
      actionableInsights: [
        {
          targetAudience: 'Researchers',
          recommendation: 'Incorporate skip/residual connections into custom deep network designs to stabilize gradient flow and prevent training stagnation.',
          impactLevel: 'Critical'
        },
        {
          targetAudience: 'Engineers & Developers',
          recommendation: 'Use ResNet-50 or ResNet-101 pre-trained weights as standard visual encoders for transfer learning in industrial vision tasks.',
          impactLevel: 'High'
        }
      ],
      keyMetrics: [
        { label: 'ImageNet Top-5 Error', value: '3.57%', baseline: '6.71%', improvement: '-3.14% Error', description: '1st place in ILSVRC 2015 classification' },
        { label: 'Network Depth', value: '152 Layers', baseline: '19 Layers (VGG)', improvement: '8x Deeper', description: 'First successful training of 100+ layer deep neural networks' },
        { label: 'COCO Detection mAP', value: '28.0%', baseline: '21.9%', improvement: '+6.1% mAP', description: '1st place on COCO 2015 object detection benchmark' }
      ],
      pipelineSteps: [
        { stepNumber: 1, name: 'Input Image & Conv1 Prep', description: '7x7 conv with stride 2 followed by 3x3 max pooling.', keyTechnique: 'Initial Feature Map Extraction' },
        { stepNumber: 2, name: 'Residual Block Stack', description: 'Pass input x through conv layers to produce F(x) and add input x via shortcut: F(x) + x.', keyTechnique: 'Identity Shortcut Mapping' },
        { stepNumber: 3, name: 'Bottleneck Dimension Reduction', description: 'Apply 1x1 conv to compress dimensions, 3x3 conv, and 1x1 conv to expand.', keyTechnique: 'Bottleneck Design' },
        { stepNumber: 4, name: 'Global Average Pooling & Softmax', description: 'Collapse spatial feature maps into a 1D vector for classification.', keyTechnique: 'GAP + Dense Classifier' }
      ],
      charts: [
        {
          id: 'imagenet-error',
          chartTitle: 'ImageNet Top-5 Error Rate Across Historical Models (%)',
          chartType: 'bar',
          xAxisLabel: 'Architecture',
          yAxisLabel: 'Top-5 Test Error % (Lower is Better)',
          description: 'ResNet-152 established a historic milestone by surpassing human-level vision accuracy (approx ~5.1%).',
          dataKeys: ['Top5_Error'],
          data: [
            { name: 'AlexNet (2012)', Top5_Error: 16.4 },
            { name: 'ZFNet (2013)', Top5_Error: 11.7 },
            { name: 'VGG-16 (2014)', Top5_Error: 7.3 },
            { name: 'GoogLeNet (2014)', Top5_Error: 6.7 },
            { name: 'ResNet-152 (2015)', Top5_Error: 3.57 }
          ]
        },
        {
          id: 'depth-vs-error',
          chartTitle: 'Training & Validation Error vs Network Depth',
          chartType: 'line',
          xAxisLabel: 'ResNet Depth Variants',
          yAxisLabel: 'Top-1 Validation Error (%)',
          description: 'Plain networks degrade with increased depth, while ResNet accuracy consistently improves up to 152 layers.',
          dataKeys: ['Plain_Network_Error', 'ResNet_Error'],
          data: [
            { name: '18 Layers', Plain_Network_Error: 27.9, ResNet_Error: 27.8 },
            { name: '34 Layers', Plain_Network_Error: 28.5, ResNet_Error: 25.0 },
            { name: '50 Layers', Plain_Network_Error: 31.2, ResNet_Error: 22.8 },
            { name: '101 Layers', Plain_Network_Error: 34.5, ResNet_Error: 21.7 },
            { name: '152 Layers', Plain_Network_Error: 38.0, ResNet_Error: 21.4 }
          ]
        }
      ],
      glossary: [
        { term: 'Residual Mapping', definition: 'Optimizing F(x) = H(x) - x, making it much easier for stacked layers to learn identity functions if optimal.' },
        { term: 'Degradation Problem', definition: 'The phenomenon where increasing network depth leads to higher training error, solved by ResNet shortcut connections.' }
      ],
      citation: 'He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep residual learning for image recognition. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), pp. 770-778.',
      formulas: [
        {
          id: 'residual-mapping',
          name: 'Residual Learning Formulation',
          latex: '\\mathbf{y} = \\mathcal{F}(\\mathbf{x}, \\{W_i\\}) + \\mathbf{x}',
          description: 'Rather than fitting an underlying mapping H(x), the stacked nonlinear layers fit a residual mapping F(x) = H(x) - x, while the identity shortcut x directly forwards input without adding parameter cost.',
          variables: [
            { symbol: '\\mathbf{x}', meaning: 'Input Feature Map', intuition: 'Activation tensor entering the residual block from previous layers.', dimensions: 'C \\times H \\times W' },
            { symbol: '\\mathcal{F}(\\cdot)', meaning: 'Residual Function', intuition: 'Stack of 2 or 3 convolution + batch-norm + ReLU transformations to be learned.', dimensions: 'C \\times H \\times W' },
            { symbol: 'W_i', meaning: 'Layer Weights', intuition: 'Learnable convolutional kernels within the building block.', dimensions: 'K \\times K \\times C_{in} \\times C_{out}' },
            { symbol: '\\mathbf{y}', meaning: 'Output Feature Map', intuition: 'Element-wise sum of residual signal and skip connection passed to subsequent ReLU.', dimensions: 'C \\times H \\times W' }
          ]
        },
        {
          id: 'projection-shortcut',
          name: 'Dimension Matching Projection Shortcut',
          latex: '\\mathbf{y} = \\mathcal{F}(\\mathbf{x}, \\{W_i\\}) + W_s \\mathbf{x}',
          description: 'When input and output channel dimensions differ, a linear projection matrix W_s (1x1 convolution with stride) matches tensor dimensions.',
          variables: [
            { symbol: 'W_s', meaning: 'Projection Matrix', intuition: '1x1 convolution projecting input channels from C_in to C_out and downsampling spatial dimensions.', dimensions: 'C_{out} \\times C_{in}' }
          ]
        }
      ],
      citationNodes: [
        { id: 'rn1', title: 'Gradient-Based Learning Applied to Document Recognition (LeNet)', authors: 'LeCun et al.', year: '1998', citationsCount: 52000, type: 'foundation', relevanceScore: 92, keyContribution: 'Pioneered convolutional neural networks and backpropagation.' },
        { id: 'rn2', title: 'ImageNet Classification with Deep Convolutional Neural Networks (AlexNet)', authors: 'Krizhevsky et al.', year: '2012', citationsCount: 142000, type: 'foundation', relevanceScore: 97, keyContribution: 'Revived deep CNNs with GPU acceleration and ReLU activations.' },
        { id: 'rn3', title: 'Very Deep Convolutional Networks for Large-Scale Image Recognition (VGG)', authors: 'Simonyan & Zisserman', year: '2014', citationsCount: 118000, type: 'competitor', relevanceScore: 95, keyContribution: 'Pushed depth to 16-19 layers with 3x3 conv filters, but hit degradation limits.' },
        { id: 'rn4', title: 'Deep Residual Learning for Image Recognition (ResNet)', authors: 'He et al.', year: '2015', citationsCount: 215000, type: 'target', relevanceScore: 100, keyContribution: 'Introduced residual learning and identity shortcut connections up to 152 layers.' },
        { id: 'rn5', title: 'Densely Connected Convolutional Networks (DenseNet)', authors: 'Huang et al.', year: '2017', citationsCount: 41000, type: 'descendant', relevanceScore: 93, keyContribution: 'Connected all subsequent layers directly together via feature concatenation.' },
        { id: 'rn6', title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (ViT)', authors: 'Dosovitskiy et al.', year: '2020', citationsCount: 38000, type: 'descendant', relevanceScore: 96, keyContribution: 'Transformed computer vision from CNN convolutions to pure Vision Transformers.' }
      ]
    }
  },
  {
    id: 'alphafold-2021',
    title: 'Highly Accurate Protein Structure Prediction with AlphaFold',
    authors: 'John Jumper, Richard Evans, Alexander Pritzel, Tim Green, Michael Figurnov, Olaf Ronneberger, et al.',
    year: '2021',
    field: 'Computational Biology / AI for Science',
    badge: 'Nature Paper of the Year',
    abstractSnippet: 'Proteins are essential to life, and understanding their 3D structures is key to understanding biological function. We present AlphaFold 2, a novel machine learning approach that incorporates physical and biological knowledge about protein structure, demonstrating accuracy competitive with experimental methods.',
    fullText: `Highly accurate protein structure prediction with AlphaFold. John Jumper et al. DeepMind.
    Proteins are essential to life, and understanding their structure can facilitate a deeper understanding of function. We present AlphaFold, a novel machine learning approach that incorporates physical and biological knowledge about protein structure, leveraging multi-sequence alignments into a deep learning framework. AlphaFold achieved atomic accuracy in CASP14, solving a 50-year-old challenge in structural biology.`,
    preCalculatedSummary: {
      title: 'Highly Accurate Protein Structure Prediction with AlphaFold',
      authors: ['John Jumper', 'Richard Evans', 'Alexander Pritzel', 'Tim Green', 'Michael Figurnov', 'Olaf Ronneberger', 'Demis Hassabis'],
      institution: 'DeepMind',
      publicationYear: '2021',
      field: 'AI in Structural Biology & Molecular Biophysics',
      tldr: 'Solved the 50-year-old protein folding grand challenge by predicting 3D atomic structures directly from amino acid sequences using Evoformer transformer modules.',
      executiveSummary: 'DeepMind introduced AlphaFold 2, a revolutionary deep learning model that predicts 3D protein structures with atomic accuracy from amino acid sequences alone. By replacing traditional spatial heuristics with an end-to-end differentiable neural network incorporating spatial invariance and Evolutionary Multiple Sequence Alignments (MSA), AlphaFold achieved unprecedented results at CASP14.\n\nAlphaFold has folded over 200 million protein structures across virtually all known organisms, accelerating drug discovery, disease understanding, and enzyme engineering globally.',
      keyTakeaways: [
        {
          category: 'Innovation',
          title: 'Evoformer & Pair Representation Architecture',
          description: 'Exchanges geometric and evolutionary attention information dynamically between MSA rows and 2D residue pair matrices.'
        },
        {
          category: 'Finding',
          title: 'Atomic Precision (<1.5 Å RMSD)',
          description: 'Achieved a median GDT_TS score of 92.4 at CASP14, placing predictions on par with expensive X-ray crystallography and Cryo-EM.'
        },
        {
          category: 'Impact',
          title: 'Open Science & Global Bio-Database',
          description: 'Folded 200M+ protein structures, freely available to 1M+ researchers worldwide for target drug design.'
        }
      ],
      actionableInsights: [
        {
          targetAudience: 'Researchers',
          recommendation: 'Use AlphaFold predicted structures as initial phasing models for X-ray crystallography or Cryo-EM map fitting.',
          impactLevel: 'Critical'
        },
        {
          targetAudience: 'Product & Business',
          recommendation: 'Integrate AlphaFold API/Database into computational biopharma pipelines to screen therapeutic candidates faster.',
          impactLevel: 'High'
        }
      ],
      keyMetrics: [
        { label: 'CASP14 Median GDT Score', value: '92.4', baseline: '61.2', improvement: '+31.2 GDT', description: 'Overwhelming victory in CASP14 competition' },
        { label: 'Backbone RMSD Error', value: '0.96 Å', baseline: '3.2 Å', improvement: 'Sub-Angstrom', description: 'Atomic-level spatial accuracy' },
        { label: 'Proteome Coverage', value: '200M+ Proteins', baseline: '<200k (PDB)', improvement: '1,000x Expansion', description: 'Mapped nearly all known biological protein structures' }
      ],
      pipelineSteps: [
        { stepNumber: 1, name: 'Genetic Search & MSA Generation', description: 'Search genetic databases to construct Multiple Sequence Alignment and template pairs.', keyTechnique: 'Jackhmmer / HHblits MSA' },
        { stepNumber: 2, name: 'Evoformer Block Processing', description: '48 iterations updating MSA and Pair representations with axial attention.', keyTechnique: 'Triangular Multiplicative Updates' },
        { stepNumber: 3, name: 'Structure Module 3D Projection', description: 'Predict rotation and translation frame for each amino acid residue.', keyTechnique: 'Invariant Point Attention (IPA)' },
        { stepNumber: 4, name: 'Amber Relaxation', description: 'Stereochemical energy minimization to resolve atomic overlaps.', keyTechnique: 'Molecular Mechanics Force Fields' }
      ],
      charts: [
        {
          id: 'casp-gdt-history',
          chartTitle: 'CASP Global Distance Test (GDT) Historical Evolution',
          chartType: 'bar',
          xAxisLabel: 'CASP Competition Edition',
          yAxisLabel: 'Median GDT_TS Score (100 = Perfect)',
          description: 'AlphaFold 2 reached 92.4 GDT at CASP14, surpassing the threshold required for competitive experimental resolution.',
          dataKeys: ['Median_GDT'],
          data: [
            { name: 'CASP11 (2014)', Median_GDT: 40.1 },
            { name: 'CASP12 (2016)', Median_GDT: 42.5 },
            { name: 'CASP13 (2018)', Median_GDT: 61.2 },
            { name: 'CASP14 AlphaFold 2 (2020)', Median_GDT: 92.4 }
          ]
        },
        {
          id: 'rmsd-distribution',
          chartTitle: 'Predicted Structural Accuracy (C-alpha RMSD Error in Angstroms)',
          chartType: 'area',
          xAxisLabel: 'Target Category Complexity',
          yAxisLabel: 'RMSD Error Å (Lower is Better)',
          description: 'AlphaFold maintains sub-angstrom spatial accuracy across monomeric and complex multi-domain targets.',
          dataKeys: ['AlphaFold2', 'Baseline_DeepLearning'],
          data: [
            { name: 'Easy Monomers', AlphaFold2: 0.8, Baseline_DeepLearning: 2.8 },
            { name: 'Medium Domains', AlphaFold2: 1.1, Baseline_DeepLearning: 3.9 },
            { name: 'Hard Novel Folds', AlphaFold2: 1.5, Baseline_DeepLearning: 5.4 },
            { name: 'Multi-Chain Complexes', AlphaFold2: 1.8, Baseline_DeepLearning: 7.2 }
          ]
        }
      ],
      glossary: [
        { term: 'GDT (Global Distance Test)', definition: 'A metric measuring structural similarity between predicted and experimental protein coordinates ranging from 0 to 100.' },
        { term: 'Evoformer', definition: 'The core neural network module in AlphaFold 2 that updates MSA representations and 2D pair distances simultaneously.' }
      ],
      citation: 'Jumper, J., Evans, R., Pritzel, A., Green, T., Figurnov, M., Ronneberger, O., ... & Hassabis, D. (2021). Highly accurate protein structure prediction with AlphaFold. Nature, 596(7873), 583-589.',
      formulas: [
        {
          id: 'rigid-frame-se3',
          name: 'Rigid Frame Euclidean Group SE(3) Transformation',
          latex: 'T_i \\circ \\vec{x} = R_i \\vec{x} + \\vec{t}_i, \\quad R_i \\in SO(3), \\, \\vec{t}_i \\in \\mathbb{R}^3',
          description: 'Each amino acid residue is parameterized as an independent local reference frame defined by backbone nitrogen, C-alpha, and carbon atoms.',
          variables: [
            { symbol: 'T_i', meaning: 'Residue Euclidean Frame', intuition: 'Rigid body transformation placing residue i in 3D global Cartesian space.', dimensions: 'SE(3)' },
            { symbol: 'R_i', meaning: 'Rotation Matrix / Unit Quaternion', intuition: 'Rotational orientation of residue backbone plane.', dimensions: '3 \\times 3' },
            { symbol: '\\vec{t}_i', meaning: 'Translation Vector', intuition: 'Global 3D coordinates of the alpha-carbon atom (C_alpha).', dimensions: '\\mathbb{R}^3' }
          ]
        },
        {
          id: 'fape-loss',
          name: 'Frame Aligned Point Error (FAPE) Loss',
          latex: '\\mathcal{L}_{\\text{FAPE}} = \\frac{1}{N_{\\text{frames}}^2} \\sum_{i,j} \\min\\left(d_{\\text{clamp}}, \\|T_i^{-1} \\circ \\vec{x}_j - \\hat{T}_i^{-1} \\circ \\hat{\\vec{x}}_j\\|\\right)',
          description: 'Measures all pairwise atomic distances in local reference frames rather than global space, ensuring SE(3) rotational and translational invariance without alignment.',
          variables: [
            { symbol: 'T_i^{-1} \\circ \\vec{x}_j', meaning: 'Local Frame Projection', intuition: 'Position of atom j evaluated specifically from the vantage point of residue frame i.', dimensions: '\\mathbb{R}^3' },
            { symbol: 'd_{\\text{clamp}}', meaning: 'Clamping Distance Threshold', intuition: 'Prevents massive penalties on unaligned disordered loops (typically 10 Angstroms).', dimensions: '10 \\, \\text{Å}' }
          ]
        }
      ],
      citationNodes: [
        { id: 'af1', title: 'Anfinsen\'s Dogma / Principles that Govern the Folding of Protein Chains', authors: 'Christian B. Anfinsen', year: '1973', citationsCount: 16500, type: 'foundation', relevanceScore: 95, keyContribution: 'Established that native protein structure is determined strictly by its amino acid sequence.' },
        { id: 'af2', title: 'De Novo Protein Structure Determination using Rosetta', authors: 'Simons, Rohl, Baker et al.', year: '1999', citationsCount: 9400, type: 'foundation', relevanceScore: 89, keyContribution: 'Physical energy minimization and Monte Carlo fragment assembly.' },
        { id: 'af3', title: 'Highly Accurate Protein Structure Prediction with AlphaFold', authors: 'Jumper et al. (AlphaFold 2)', year: '2021', citationsCount: 26000, type: 'target', relevanceScore: 100, keyContribution: 'End-to-end Evoformer transformer and Invariant Point Attention solving CASP14.' },
        { id: 'af4', title: 'Accurate Prediction of Protein Structures and Interactions using RoseTTAFold', authors: 'Baek et al.', year: '2021', citationsCount: 5100, type: 'competitor', relevanceScore: 93, keyContribution: 'Three-track neural network predicting simultaneous 1D sequence, 2D distance, and 3D coordinates.' }
      ]
    }
  },
  {
    id: 'disha-2026',
    title: 'DISHA: Multimodal Emotional AI Companion',
    authors: 'Sobrat Dayal, Maya Research Collective, Frontier Cognitive Systems Lab',
    year: '2026',
    field: 'Multimodal Emotional AI & Affective Computing',
    badge: 'Frontier Affective AI',
    abstractSnippet: 'DISHA introduces a real-time multimodal emotional AI companion combining a 3-Brain architecture (Eye CNN, Ear LSTM, and Mind BERT) with an intelligent confidence-weighted fusion engine and on-device SUTRA crisis escalation protocols.',
    fullText: `DISHA: Multimodal Emotional AI Companion and Autonomous Affective Copilot.
    By Sobrat Dayal, Maya Research Collective & Frontier Cognitive Systems Lab.
    Modern human-computer emotional interaction demands low-latency, empathetic, and privacy-preserving inference across visual facial action coding, vocal acoustic prosody, and linguistic semantic sentiment. We present DISHA (Distributed Intelligent Sympathetic Humanoid Assistant), a unified multimodal emotional architecture designed to perceive, synthesize, and adapt to human emotional subtleties in real time.
    
    The core foundation is the 3-Brain Architecture:
    1. The Eye (Spatial CNN with Facial Landmark Tracking): Processes 68 facial landmark coordinates and micro-expression FACS action units (AU1, AU2, AU4, AU12) at 60 FPS with 14ms latency.
    2. The Ear (Temporal Bi-LSTM with MFCC / Mel-Spectrogram Filterbanks): Extracts pitch variation, jitter, shimmer, and vocal energy dynamics to distinguish hesitation, anxiety, and enthusiasm.
    3. The Mind (Quantized BERT / DistilRoBERTa): Decodes semantic intent, contextual nuances, emotional sentiment valence (-1.0 to +1.0), and conversational memory state.

    The Intelligent Confidence-Weighted Fusion Engine dynamically calibrates each modality's reliability coefficient based on ambient signal-to-noise ratio (SNR) and visual occlusion. In low-light settings, acoustic weights dynamically scale to 78%, while in noisy environments facial action units take precedence.
    
    Edge Device Optimizations: The entire pipeline is compressed via 4-bit INT4 quantization and TensorRT pruning into a sub-420MB memory footprint, executing seamlessly on mobile edge NPUs at under 28ms roundtrip latency.
    
    Safety Protocols & Crisis Escalation: Built on the SUTRA framework, DISHA monitors for psychological distress signals, self-harm risk indicators, and crisis markers, executing immediate de-escalation protocols and humanitarian escalation triggers.`,
    preCalculatedSummary: {
      title: 'DISHA: Multimodal Emotional AI Companion',
      authors: ['Sobrat Dayal', 'Maya Research Collective', 'Frontier Cognitive Systems Lab'],
      institution: 'Frontier Affective AI & Cognitive Robotics Lab',
      publicationYear: '2026',
      field: 'Multimodal Emotional AI & Affective Computing',
      tldr: 'Introduces the 3-Brain Architecture (Eye CNN, Ear LSTM, Mind BERT) with confidence-weighted multimodal fusion and SUTRA on-device crisis escalation for empathetic AI companions.',
      executiveSummary: 'DISHA (Distributed Intelligent Sympathetic Humanoid Assistant) is a breakthrough real-time multimodal emotional AI companion. By integrating facial micro-expression vision (Eye), acoustic vocal prosody (Ear), and semantic natural language understanding (Mind), DISHA achieves 94.8% emotional recognition accuracy while operating on-device in under 28ms.\n\nThe system features an Intelligent Confidence-Weighted Fusion Engine that dynamically adjusts sensor weightings during sensor degradation (e.g. poor lighting or background noise). Hardened safety and crisis escalation protocols built on the SUTRA framework ensure proactive distress intervention while preserving edge privacy.',
      keyTakeaways: [
        {
          category: 'Innovation',
          title: '3-Brain Heterogeneous Architecture',
          description: 'Tri-modal decoupled processing combining Spatial CNN (Facial FACS), Bidirectional LSTM (Vocal prosody/MFCCs), and quantized BERT (Semantic intent).'
        },
        {
          category: 'Methodology',
          title: 'Intelligent Confidence-Weighted Fusion',
          description: 'Bayesian SNR calibration that dynamically adjusts modal weights between facial, vocal, and textual streams when sensory noise or occlusion occurs.'
        },
        {
          category: 'Finding',
          title: 'Sub-28ms Edge Execution with 94.8% Accuracy',
          description: 'INT4 model pruning enables zero-cloud on-device inference with a sub-420MB memory footprint, beating classical cloud architectures by 3.4x in latency.'
        },
        {
          category: 'Impact',
          title: 'SUTRA Real-Time Safety & Crisis Escalation',
          description: 'Deterministic rule-based safety circuit breaker that detects psychological danger markers and immediately triggers de-escalation scripts.'
        }
      ],
      actionableInsights: [
        {
          targetAudience: 'Engineers & Developers',
          recommendation: 'Deploy INT4 quantized multi-stream models with TensorRT-LLM on mobile NPUs for zero-latency local affective computing.',
          impactLevel: 'Critical'
        },
        {
          targetAudience: 'Product & Business',
          recommendation: 'Integrate confidence-weighted fusion into customer support, clinical mental health monitoring, and personalized learning companions.',
          impactLevel: 'High'
        },
        {
          targetAudience: 'Researchers',
          recommendation: 'Investigate cross-cultural micro-expression variance and adaptive affective calibration for longitudinal companion empathy.',
          impactLevel: 'High'
        }
      ],
      keyMetrics: [
        { label: 'Emotion Classification F1', value: '94.8%', baseline: '82.3%', improvement: '+12.5%', description: 'Weighted cross-modal accuracy across 8 discrete emotional states.' },
        { label: 'Edge Inference Latency', value: '27.4 ms', baseline: '95.0 ms', improvement: '-71.2%', description: 'Total end-to-end multimodal perception and synthesis latency on mobile NPU.' },
        { label: 'Memory Footprint', value: '412 MB', baseline: '1,850 MB', improvement: '-77.7%', description: 'Total RAM footprint after 4-bit INT4 quantization.' },
        { label: 'SUTRA Safety Recall', value: '99.4%', baseline: '88.1%', improvement: '+11.3%', description: 'Crisis detection sensitivity on standard affective benchmark datasets.' }
      ],
      pipelineSteps: [
        { stepNumber: 1, name: 'Tri-Modal Sensor Capture', description: 'Simultaneous acquisition of 60 FPS RGB video, 48kHz audio stream, and user conversational input.', keyTechnique: 'MediaStream Synchronizer' },
        { stepNumber: 2, name: 'Feature Extraction (3-Brain)', description: 'Eye (CNN) extracts 68 facial landmarks; Ear (LSTM) extracts 40 MFCC features; Mind (BERT) tokenizes contextual text.', keyTechnique: 'Decoupled Parallel Inference' },
        { stepNumber: 3, name: 'Confidence-Weighted Fusion', description: 'Dynamically computes modality reliability scores based on SNR and facial occlusion probability.', keyTechnique: 'Bayesian Sensor Fusion' },
        { stepNumber: 4, name: 'SUTRA Crisis & Empathy Synthesis', description: 'Evaluates emotional valence, checks safety boundaries, and generates empathetic conversational voice/text response.', keyTechnique: 'Constrained Reinforcement Learning' }
      ],
      charts: [
        {
          id: 'disha-acc',
          chartTitle: 'Modality Ablation & Emotion Recognition Accuracy',
          chartType: 'bar',
          xAxisLabel: 'Architecture Configuration',
          yAxisLabel: 'Recognition Accuracy (%)',
          description: 'Comparison of single-modality baselines versus the full DISHA 3-Brain fused architecture.',
          dataKeys: ['Accuracy', 'NoiseRobustness'],
          data: [
            { name: 'Text Only (BERT)', Accuracy: 74, NoiseRobustness: 68 },
            { name: 'Vision Only (CNN)', Accuracy: 79, NoiseRobustness: 62 },
            { name: 'Audio Only (LSTM)', Accuracy: 81, NoiseRobustness: 71 },
            { name: 'Early Fusion Baseline', Accuracy: 86, NoiseRobustness: 75 },
            { name: 'DISHA 3-Brain Fused', Accuracy: 95, NoiseRobustness: 92 }
          ]
        },
        {
          id: 'disha-radar',
          chartTitle: 'Affective Perception Dimensions Across 8 Emotions',
          chartType: 'radar',
          description: 'Multidimensional emotional classification precision across joy, sadness, surprise, anger, anxiety, neutral, disgust, and curiosity.',
          dataKeys: ['DISHA', 'BaselineSOTA'],
          data: [
            { name: 'Joy', DISHA: 98, BaselineSOTA: 88 },
            { name: 'Sadness', DISHA: 94, BaselineSOTA: 82 },
            { name: 'Surprise', DISHA: 96, BaselineSOTA: 85 },
            { name: 'Anger', DISHA: 93, BaselineSOTA: 80 },
            { name: 'Anxiety', DISHA: 92, BaselineSOTA: 74 },
            { name: 'Neutral', DISHA: 97, BaselineSOTA: 91 },
            { name: 'Disgust', DISHA: 91, BaselineSOTA: 78 },
            { name: 'Curiosity', DISHA: 95, BaselineSOTA: 81 }
          ]
        }
      ],
      glossary: [
        { term: '3-Brain Architecture', definition: 'A decoupled neural framework partitioning perception into Eye (Spatial CNN), Ear (Acoustic LSTM), and Mind (Semantic BERT).' },
        { term: 'FACS Action Units', definition: 'Facial Action Coding System metrics that measure anatomical muscle contractions for micro-expression classification.' },
        { term: 'SUTRA Framework', definition: 'Systematic Universal Threat Response Algorithm ensuring real-time crisis escalation and mental health boundary enforcement.' },
        { term: 'Confidence-Weighted Fusion', definition: 'A dynamic weighting mechanism calculating reliability coefficients for each sensor stream based on environmental signal degradation.' }
      ],
      citation: 'Dayal, S., et al. (2026). DISHA: Multimodal Emotional AI Companion with Confidence-Weighted Fusion and On-Device Affective Reasoning. Frontier Cognitive Systems, 12(4), 104-122.',
      formulas: [
        {
          id: 'disha-fusion',
          name: 'Dynamic Confidence-Weighted Multimodal Fusion',
          latex: 'E_{\\text{fused}} = \\sum_{m \\in \\{V, A, T\\}} w_m(\\sigma_m) \\cdot f_m(X_m), \\quad w_m = \\frac{\\exp(\\alpha_m / \\sigma_m^2)}{\\sum_k \\exp(\\alpha_k / \\sigma_k^2)}',
          description: 'Weighting coefficients w_m adapt inversely with modality noise variance sigma_m, prioritizing whichever sensor stream has the highest signal purity.',
          variables: [
            { symbol: 'E_{\\text{fused}}', meaning: 'Fused Emotional State Vector', intuition: 'The final 8-dimensional affective probability distribution.' },
            { symbol: 'w_m', meaning: 'Modality Reliability Weight', intuition: 'Normalized confidence assigned to Vision (V), Audio (A), or Text (T).' },
            { symbol: '\\sigma_m', meaning: 'Modality Noise Variance / Occlusion', intuition: 'Measures environmental degradation (e.g. dark room, background chatter).' }
          ]
        },
        {
          id: 'sutra-distress',
          name: 'SUTRA Psychological Distress Threshold Metric',
          latex: '\\mathcal{D}(t) = \\gamma \\mathcal{D}(t-1) + (1-\\gamma) \\left[ \\beta_1 \\mathcal{A}(t) + \\beta_2 (1 - \\mathcal{V}(t)) + \\beta_3 \\mathcal{L}_{\\text{crisis}}(t) \\right]',
          description: 'Exponentially weighted moving average of user acoustic arousal A(t), negative valence (1 - V(t)), and semantic crisis tokens L_crisis(t). When D(t) exceeds safety threshold theta, crisis protocol fires immediately.',
          variables: [
            { symbol: '\\mathcal{D}(t)', meaning: 'Cumulative Distress Index', intuition: 'Real-time score tracking emotional volatility and crisis likelihood.' },
            { symbol: '\\gamma', meaning: 'Temporal Decay Factor', intuition: 'Memory coefficient stabilizing rapid momentary fluctuations (typically 0.85).' },
            { symbol: '\\mathcal{L}_{\\text{crisis}}', meaning: 'Semantic Crisis Token Activation', intuition: 'Direct trigger activations from vetted psychological distress lexicons.' }
          ]
        }
      ],
      citationNodes: [
        { id: 'd1', title: 'Affective Computing and Sentic Modulation', authors: 'Rosalind Picard', year: '1997', citationsCount: 14200, type: 'foundation', relevanceScore: 96, keyContribution: 'Pioneered computer emotional recognition and biometric affective synthesis.' },
        { id: 'd2', title: 'Facial Action Coding System (FACS): A Technique for the Measurement of Facial Movement', authors: 'Ekman & Friesen', year: '1978', citationsCount: 28500, type: 'foundation', relevanceScore: 98, keyContribution: 'Standardized anatomical facial muscle contractions and emotional states.' },
        { id: 'd3', title: 'DISHA: Multimodal Emotional AI Companion', authors: 'Sobrat Dayal et al.', year: '2026', citationsCount: 140, type: 'target', relevanceScore: 100, keyContribution: '3-Brain architecture with confidence-weighted fusion and on-device SUTRA safety.' },
        { id: 'd4', title: 'Multimodal Emotion Recognition with Deep Bidirectional LSTMs', authors: 'Chernykh et al.', year: '2020', citationsCount: 1950, type: 'competitor', relevanceScore: 88, keyContribution: 'Acoustic-linguistic dual stream sentiment analysis.' }
      ]
    }
  },
  {
    id: 'vectors-r',
    title: 'Fundamentals of Vectors in R & High-Dimensional Geometry',
    authors: 'Dr. Alistair Finch & Hadley Wickham',
    year: '2026',
    field: 'Statistical Computing & Linear Algebra',
    badge: 'Mathematics & Data Science',
    abstractSnippet: 'A rigorous exposition on atomic vector semantics, memory allocation, broadcasting rules, and high-dimensional geometric projections in R and tidy data structures.',
    fullText: 'Fundamentals of Vectors in R and High-Dimensional Vector Spaces...',
    preCalculatedSummary: {
      title: 'Fundamentals of Vectors in R & High-Dimensional Geometry',
      authors: ['Dr. Alistair Finch', 'Hadley Wickham'],
      institution: 'R Core Group & University of Auckland',
      publicationYear: '2026',
      field: 'Statistical Computing & Linear Algebra',
      tldr: 'Rigorous mathematical and computational analysis of atomic vectors, copy-on-modify memory mechanics, and high-dimensional projections in R.',
      executiveSummary: 'This foundational guide demystifies vector algebra in R. From memory management (contiguous C arrays and copy-on-modify semantics) to orthogonal projections and PCA transformations, the paper bridges pure linear algebra with high-performance statistical programming.',
      keyTakeaways: [
        { category: 'Methodology', title: 'Copy-on-Modify Memory Allocation', description: 'Vectors share identical pointers in memory until an element is mutated, minimizing RAM overhead.' },
        { category: 'Innovation', title: 'SIMD-Accelerated Vectorization', description: 'Leveraging AVX-512 vector extensions for parallel numeric operations without interpreter loops.' }
      ],
      actionableInsights: [
        { targetAudience: 'Engineers & Developers', recommendation: 'Pre-allocate vector capacities instead of dynamically growing with c() or append() to prevent O(N^2) memory re-allocations.', impactLevel: 'Critical' }
      ],
      keyMetrics: [
        { label: 'Vectorized Speedup', value: '184x', baseline: '1.0x', improvement: '+18,300%', description: 'Speedup of vectorized C routines over native R for-loops.' }
      ],
      pipelineSteps: [
        { stepNumber: 1, name: 'Memory Allocation', description: 'Allocates contiguous memory chunk aligned with CPU cache lines.' }
      ],
      charts: [],
      glossary: [{ term: 'Atomic Vector', definition: 'A 1-dimensional array containing elements of strictly one data type.' }],
      citation: 'Finch, A. & Wickham, H. (2026). Fundamentals of Vectors in R. Journal of Statistical Software, 44(2).'
    }
  },
  {
    id: 'ai-fundamentals',
    title: 'Artificial Intelligence Fundamentals and Cognitive Architectures',
    authors: 'Stuart Russell, Peter Norvig, Demis Hassabis',
    year: '2026',
    field: 'Cognitive Computing & Foundational AI',
    badge: 'Foundational Theory',
    abstractSnippet: 'Unifying symbolic reasoning, probabilistic graphical models, and modern deep reinforcement learning into a unified cognitive agent architecture.',
    fullText: 'Artificial Intelligence Fundamentals and Cognitive Architectures...',
    preCalculatedSummary: {
      title: 'Artificial Intelligence Fundamentals and Cognitive Architectures',
      authors: ['Stuart Russell', 'Peter Norvig', 'Demis Hassabis'],
      institution: 'UC Berkeley & DeepMind',
      publicationYear: '2026',
      field: 'Cognitive Computing & Foundational AI',
      tldr: 'Unifies symbolic GOFAI logic with modern transformer-based foundation models and world models.',
      executiveSummary: 'This seminal monograph surveys the evolution of intelligent agents: from search trees and Bellman equations to modern self-supervised foundation models and tree-of-thought planning.',
      keyTakeaways: [
        { category: 'Innovation', title: 'Hybrid Neuro-Symbolic Agents', description: 'Combining fast probabilistic neural heuristics (System 1) with formal verifiable symbolic verifiers (System 2).' }
      ],
      actionableInsights: [
        { targetAudience: 'Researchers', recommendation: 'Incorporate external verification engines to ground LLM reasoning and eliminate hallucinations.', impactLevel: 'High' }
      ],
      keyMetrics: [
        { label: 'Reasoning Reliability', value: '96.2%', baseline: '71.5%', improvement: '+24.7%', description: 'Verification pass rate when neural generators are coupled with symbolic constraint solvers.' }
      ],
      pipelineSteps: [
        { stepNumber: 1, name: 'Perception & State Estimation', description: 'Converts multi-modal observations into world-model latent state representations.' }
      ],
      charts: [],
      glossary: [{ term: 'Cognitive Architecture', definition: 'A blueprint for intelligent agents structuring memory, reasoning, perception, and planning.' }],
      citation: 'Russell, S., Norvig, P. & Hassabis, D. (2026). Artificial Intelligence Fundamentals. MIT Press.'
    }
  },
  {
    id: 'hbr-eq',
    title: 'The HBR Emotional Intelligence Series',
    authors: 'Harvard Business Review, Daniel Goleman, Richard Boyatzis',
    year: '2026',
    field: 'Organizational Psychology & Executive Leadership',
    badge: 'Executive Series',
    abstractSnippet: 'Empirical frameworks on emotional agility, empathetic leadership, conflict resolution, and self-awareness in high-stakes organizational environments.',
    fullText: 'The HBR Emotional Intelligence Series. Harvard Business Review Press...',
    preCalculatedSummary: {
      title: 'The HBR Emotional Intelligence Series',
      authors: ['Harvard Business Review Editors', 'Daniel Goleman', 'Richard Boyatzis'],
      institution: 'Harvard Business School Publishing',
      publicationYear: '2026',
      field: 'Organizational Psychology & Executive Leadership',
      tldr: 'Demonstrates that emotional intelligence (EQ) predicts executive success and organizational resilience far more reliably than technical IQ alone.',
      executiveSummary: 'Synthesizing 25 years of empirical leadership studies, this series proves that self-awareness, emotional self-regulation, empathy, and social agility constitute the primary drivers of executive effectiveness and sustained team output.',
      keyTakeaways: [
        { category: 'Finding', title: 'EQ Outperforms IQ in Leadership', description: 'Emotional competence accounts for nearly 90% of what sets high-performing leaders apart from average peers.' }
      ],
      actionableInsights: [
        { targetAudience: 'Product & Business', recommendation: 'Establish psychological safety as the top KPI for high-velocity engineering and product teams.', impactLevel: 'Critical' }
      ],
      keyMetrics: [
        { label: 'Team Retention Lift', value: '+42%', baseline: 'Average', improvement: '+42%', description: 'Increase in retention under leaders in the top quartile of emotional agility.' }
      ],
      pipelineSteps: [
        { stepNumber: 1, name: 'Self-Awareness Calibration', description: 'Auditing personal cognitive biases and emotional triggers.' }
      ],
      charts: [],
      glossary: [{ term: 'Emotional Agility', definition: 'The ability to navigate life’s twists and turns with self-acceptance, clear-sightedness, and an open mind.' }],
      citation: 'Harvard Business Review. (2026). The HBR Emotional Intelligence Series. Harvard Business School Press.'
    }
  },
  {
    id: 'algorithm-design',
    title: 'Introduction to Algorithm Design and Dynamic Optimization',
    authors: 'Jon Kleinberg, Éva Tardos',
    year: '2026',
    field: 'Computer Science & Algorithmics',
    badge: 'Algorithms',
    abstractSnippet: 'Comprehensive frameworks for greedy heuristics, dynamic programming, network flow, NP-completeness, and randomized polynomial-time approximations.',
    fullText: 'Introduction to Algorithm Design and Dynamic Optimization...',
    preCalculatedSummary: {
      title: 'Introduction to Algorithm Design and Dynamic Optimization',
      authors: ['Jon Kleinberg', 'Éva Tardos'],
      institution: 'Cornell University',
      publicationYear: '2026',
      field: 'Computer Science & Algorithmics',
      tldr: 'Foundational textbook on designing efficient algorithms, proving correctness, and analyzing asymptotic computational bounds.',
      executiveSummary: 'This comprehensive work covers divide-and-conquer, dynamic programming, Ford-Fulkerson max-flow algorithms, and polynomial-time reductions for NP-hard challenges.',
      keyTakeaways: [
        { category: 'Methodology', title: 'Dynamic Programming Sub-problem Overlap', description: 'Memoizing overlapping optimal sub-structures to reduce exponential recursions to polynomial time.' }
      ],
      actionableInsights: [
        { targetAudience: 'Engineers & Developers', recommendation: 'Formulate resource scheduling problems as max-flow min-cut network problems for provably optimal throughput.', impactLevel: 'High' }
      ],
      keyMetrics: [
        { label: 'Time Complexity Reduction', value: 'O(N^2)', baseline: 'O(2^N)', improvement: 'Exponential to Polynomial', description: 'Efficiency gained by dynamic programming over brute force.' }
      ],
      pipelineSteps: [{ stepNumber: 1, name: 'Problem Characterization', description: 'Analyze structural properties and establish invariant guarantees.' }],
      charts: [],
      glossary: [{ term: 'NP-Completeness', definition: 'The class of decision problems for which no polynomial-time algorithm is known, yet any proposed solution can be verified in polynomial time.' }],
      citation: 'Kleinberg, J. & Tardos, É. (2026). Algorithm Design (3rd Edition). Pearson.'
    }
  },
  {
    id: 'fuzzy-logic',
    title: 'Fuzzy Logic: Quantifiers, Modifiers and Approximate Reasoning',
    authors: 'Lotfi A. Zadeh, Bart Kosko',
    year: '2025',
    field: 'Mathematical Logic & Control Theory',
    badge: 'Cybernetics',
    abstractSnippet: 'Mathematical formalisms for membership functions, linguistic variables, t-norms, and approximate inference in continuous industrial control systems.',
    fullText: 'Fuzzy Logic: Quantifiers, Modifiers and Approximate Reasoning...',
    preCalculatedSummary: {
      title: 'Fuzzy Logic: Quantifiers, Modifiers and Approximate Reasoning',
      authors: ['Lotfi A. Zadeh', 'Bart Kosko'],
      institution: 'UC Berkeley & USC',
      publicationYear: '2025',
      field: 'Mathematical Logic & Control Theory',
      tldr: 'Extends Boolean binary logic into continuous truth value spectrum [0, 1], modeling linguistic ambiguity and approximate reasoning.',
      executiveSummary: 'This classic treatise explains how continuous membership functions allow systems to reason about imprecise natural language qualifiers like "somewhat hot" or "rapidly accelerating".',
      keyTakeaways: [{ category: 'Innovation', title: 'Continuous Membership Functions', description: 'Replaces rigid {0, 1} sets with smooth degrees of truth mu_A(x) in [0, 1].' }],
      actionableInsights: [{ targetAudience: 'Engineers & Developers', recommendation: 'Use fuzzy control for nonlinear physical systems where precise closed-form mathematical equations are intractable.', impactLevel: 'High' }],
      keyMetrics: [{ label: 'Control Stability', value: '99.8%', baseline: '92.4%', improvement: '+7.4%', description: 'Stability under severe sensory sensor noise.' }],
      pipelineSteps: [{ stepNumber: 1, name: 'Fuzzification', description: 'Transforms crisp numerical inputs into linguistic membership values.' }],
      charts: [],
      glossary: [{ term: 'Fuzzification', definition: 'The process of mapping crisp input numbers onto fuzzy linguistic sets.' }],
      citation: 'Zadeh, L. A. (2025). Fuzzy Logic and Approximate Reasoning. Information Sciences, 8(3).'
    }
  },
  {
    id: 'computer-guide',
    title: 'Essential Guide to Computer Vision & Neural Radiance Fields',
    authors: 'Ben Mildenhall, Pratul P. Srinivasan, Matthew Tancik',
    year: '2026',
    field: 'Computer Vision & 3D Deep Learning',
    badge: 'Computer Vision',
    abstractSnippet: 'Synthesizing novel photorealistic views of complex 3D scenes by optimizing a continuous volumetric 5D neural radiance field (NeRF) along camera rays.',
    fullText: 'Essential Guide to Computer Vision and Neural Radiance Fields (NeRF)...',
    preCalculatedSummary: {
      title: 'Essential Guide to Computer Vision & Neural Radiance Fields',
      authors: ['Ben Mildenhall', 'Pratul P. Srinivasan', 'Matthew Tancik'],
      institution: 'UC Berkeley & Google Research',
      publicationYear: '2026',
      field: 'Computer Vision & 3D Deep Learning',
      tldr: 'Represents 3D volumetric scenes as continuous 5D coordinate neural networks (NeRFs), enabling photorealistic novel view synthesis.',
      executiveSummary: 'This guide details how MLPs map spatial coordinates (x, y, z) and viewing angles (theta, phi) to volume density and RGB color, optimized strictly with volume rendering loss.',
      keyTakeaways: [{ category: 'Innovation', title: '5D Neural Scene Representation', description: 'Replaces discrete polygon meshes with continuous implicit neural radiance fields.' }],
      actionableInsights: [{ targetAudience: 'Engineers & Developers', recommendation: 'Employ 3D Gaussian Splatting for real-time 60+ FPS rendering on edge devices.', impactLevel: 'Critical' }],
      keyMetrics: [{ label: 'PSNR Image Quality', value: '31.0 dB', baseline: '22.4 dB', improvement: '+8.6 dB', description: 'Peak signal-to-noise ratio on novel camera viewpoint synthesis.' }],
      pipelineSteps: [{ stepNumber: 1, name: 'Ray Marching', description: 'Cast rays through camera pixels and sample 3D points along the viewing trajectory.' }],
      charts: [],
      glossary: [{ term: 'NeRF', definition: 'Neural Radiance Field: a continuous function mapping 5D coordinates to color and density.' }],
      citation: 'Mildenhall, B., et al. (2026). NeRF: Representing Scenes as Neural Radiance Fields. ECCV.'
    }
  },
  {
    id: 'cn4',
    title: 'CN 4: High-Performance Distributed Networks & Protocol Stacks',
    authors: 'Vint Cerf, Van Jacobson, Nick McKeown',
    year: '2026',
    field: 'Computer Networks & Distributed Systems',
    badge: 'Networks',
    abstractSnippet: 'Analyzing BBR congestion control, QUIC/HTTP3 transport multiplexing, eBPF kernel bypass, and P4 programmable data planes for terabit networking.',
    fullText: 'CN 4: High-Performance Distributed Networks and Protocol Stacks...',
    preCalculatedSummary: {
      title: 'CN 4: High-Performance Distributed Networks & Protocol Stacks',
      authors: ['Vint Cerf', 'Van Jacobson', 'Nick McKeown'],
      institution: 'Stanford University & Internet Engineering Task Force',
      publicationYear: '2026',
      field: 'Computer Networks & Distributed Systems',
      tldr: 'Modern architectural blueprint for zero-loss, ultra-low latency distributed networks utilizing QUIC, BBRv3, and eBPF acceleration.',
      executiveSummary: 'A comprehensive study of next-generation distributed internet backbones, detailing how QUIC eliminates head-of-line blocking and BBR maximizes bandwidth delay product (BDP).',
      keyTakeaways: [{ category: 'Methodology', title: 'BBR Congestion Control', description: 'Models bottleneck bandwidth and round-trip propagation time rather than reacting blindly to packet loss.' }],
      actionableInsights: [{ targetAudience: 'Engineers & Developers', recommendation: 'Upgrade HTTP/2 connections to QUIC/HTTP/3 to eliminate latency penalties during mobile network handoffs.', impactLevel: 'High' }],
      keyMetrics: [{ label: 'Tail Latency (p99)', value: '1.2 ms', baseline: '14.8 ms', improvement: '-91.9%', description: 'P99 roundtrip latency under 40% packet loss scenarios.' }],
      pipelineSteps: [{ stepNumber: 1, name: 'Connection Handshake', description: 'Zero-RTT cryptographic key exchange and connection migration setup.' }],
      charts: [],
      glossary: [{ term: 'QUIC', definition: 'A UDP-based multiplexed transport protocol designed to replace TCP+TLS.' }],
      citation: 'Cerf, V. et al. (2026). High-Performance Distributed Networks. ACM SIGCOMM.'
    }
  }
];
