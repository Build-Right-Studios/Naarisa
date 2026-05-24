import React from 'react';
import CuratedCollections from "../Components/Home/CuratedCollections";
import WovenWithPurpose from "../Components/Home/WovenWithPurpose";
import HeroSlider from '../Components/Home/HeroSlider';
import NewArrivals from '../Components/Home/NewArrivals';
import MostLoved from '../Components/Home/MostLoved';

function Home() {
  return (
    <div>
      <HeroSlider />
      <NewArrivals />
      <CuratedCollections />
      <WovenWithPurpose />
      <MostLoved />
    </div>
  )
}

export default Home;
