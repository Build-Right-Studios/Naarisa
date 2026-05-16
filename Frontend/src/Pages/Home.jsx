import React from 'react';
import CuratedCollections from "../Components/Home/CuratedCollections";
import WovenWithPurpose from "../Components/Home/WovenWithPurpose";
import HeroSlider from '../Components/Home/HeroSlider';

function Home() {
  return (
    <div>
      <HeroSlider />
      <CuratedCollections />
      <WovenWithPurpose />
    </div>
  )
}

export default Home;
