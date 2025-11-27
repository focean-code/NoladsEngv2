
import React from 'react';
import { H2 } from '@/components/ui';

const AnimationDemo = () => {
  return (
    <div className="p-8">
      <H2 className="mb-8 text-center">Animation Showcase</H2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Fade In</h3>
          <div className="animate-fade-in bg-blue-500 text-white p-4 rounded-md">
            Fades in
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Fade Up</h3>
          <div className="animate-fade-up bg-green-500 text-white p-4 rounded-md">
            Fades up
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Slide from Left</h3>
          <div className="animate-slide-from-left bg-purple-500 text-white p-4 rounded-md">
            Slides from left
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Scale In</h3>
          <div className="animate-scale-in bg-red-500 text-white p-4 rounded-md">
            Scales in
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Caret Blink</h3>
          <div className="flex items-center">
            <span className="text-2xl">|</span>
            <span className="animate-caret-blink text-2xl">|</span>
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Accordion</h3>
          <div className="overflow-hidden">
            <div className="animate-accordion-down">
              <div className="bg-gray-200 p-4 rounded-md">
                Accordion content
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo;
