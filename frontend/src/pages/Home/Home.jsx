import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import ContactusForm from '../../components/ContactusForm'
import Intro from '../../components/Intro/Intro'

const Home = () => {

  const [category, setCategory] = useState('All')
  return (
    <div>
      <Header/>
      {/* <Intro/> */}
      <ExploreMenu category={category} setCategory={setCategory}/>
      {/* <FoodDisplay category={category}/> */}
      <AppDownload/>
      <ContactusForm/>
    </div>
  )
}

export default Home