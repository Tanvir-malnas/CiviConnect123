
import { pipeline } from '@huggingface/transformers';

let extractor = null;

let knowledgeEmbeddings = null;

// Load the embedding model only once
const getExtractor = async () => {
  if (!extractor) {
    console.log('Loading CiviConnect semantic model...');

    extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );

    console.log('CiviConnect semantic model loaded.');
  }

  return extractor;
};

// Convert text into an embedding vector
const getEmbedding = async (text) => {
  const model = await getExtractor();

  const output = await model(text, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data);
};

// Compare two vectors using cosine similarity
const cosineSimilarity = (a, b) => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
};

const getKnowledgeEmbeddings = async (knowledge) => {
  if (knowledgeEmbeddings) {
    return knowledgeEmbeddings;
  }

  console.log('Creating CiviConnect knowledge embeddings...');

  knowledgeEmbeddings = [];

  for (const item of knowledge) {
    for (const example of item.examples || []) {
      const embedding = await getEmbedding(example);

      knowledgeEmbeddings.push({
        item,
        embedding,
      });
    }
  }

  console.log('CiviConnect knowledge embeddings ready.');

  return knowledgeEmbeddings;
};

// Find the most semantically similar knowledge item
export const findSemanticAnswer = async (
  message,
  knowledge,
  threshold = 0.70
) => {
  const userEmbedding = await getEmbedding(message);

  let bestMatch = null;
  let bestScore = 0;

 const embeddings = await getKnowledgeEmbeddings(knowledge);

for (const entry of embeddings) {
  const score = cosineSimilarity(
    userEmbedding,
    entry.embedding
  );

  if (score > bestScore) {
    bestScore = score;
    bestMatch = entry.item;
  }
}

  console.log(
    `Semantic match: ${bestMatch?.id || 'none'} | score: ${bestScore.toFixed(3)}`
  );

 if (bestMatch && bestScore >= threshold) {
  return {
    answer: bestMatch.answer,
    score: bestScore,
    source: 'civi-semantic',
    confidence: 'high',
  };
}

if (bestMatch && bestScore >= 0.50) {
  return {
    answer: bestMatch.answer,
    score: bestScore,
    source: 'civi-semantic',
    confidence: 'medium',
  };
}

return null;
};

