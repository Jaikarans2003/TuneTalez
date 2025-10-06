'use client';

import { useState } from 'react';
import EnhancedBookNarrationGenerator from '@/components/book/EnhancedBookNarrationGenerator';

export default function NarrationTestPage() {
  const [text, setText] = useState(`The air in the labyrinthine catacombs was thick with the scent of damp earth and a metallic tang that made Elara's skin crawl. Her single, flickering torch cast dancing shadows that twisted familiar shapes into monstrous figures, each one a phantom of her growing fear. The silence was not empty; it was a living thing, heavy with the weight of unseen eyes. A soft, rhythmic sound echoed from the darkness ahead—not footsteps, but the dragging of something heavy, something that scraped against the stone floor with a chilling consistency. She extinguished her torch, plunging herself into a black so absolute it felt like an embrace, and pressed her back against the cold, carved wall. The scraping grew louder, closer, and the distinct, wet sound of a slow, ragged breath filled the space where her heart used to be.

Hours later, the sun, a warm, golden eye, greeted her as she emerged from the earth. The air, now smelling of pine and wildflowers, filled her lungs with a lightness she hadn't felt in months. She saw Kaelen waiting for her by the river, his calloused hands resting on the hilt of his sword, a soft smile playing on his lips as he watched the current flow. He looked up, and his face lit with a joy that was as genuine and untamed as the forest around them. As she walked towards him, the terrors of the catacombs faded into the background, replaced by the simple, profound happiness of a shared moment, of a world that, for all its darkness, still had places of pure and uncomplicated light.`);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Enhanced Narration Generator Test</h1>
      
      <div className="mb-6">
        <label htmlFor="text" className="block text-sm font-medium mb-2">
          Text to Narrate
        </label>
        <textarea
          id="text"
          className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      
      <EnhancedBookNarrationGenerator 
        bookId="test-book-123"
        text={text}
        onSuccess={(urls) => console.log('Generated narration URLs:', urls)}
        onError={(err) => console.error('Narration error:', err)}
      />
    </div>
  );
}
