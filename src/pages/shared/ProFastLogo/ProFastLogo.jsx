import React from 'react'
import logo from '../../../assets/logo.png'
import { Link } from 'react-router';

function ProFastLogo() {
  return (
    <Link to="/">
      <div className="flex items-end">
        <img className="mb-2" src={logo} alt="" />
        <p className="text-3xl -ml-3 font-extrabold">Profast</p>
    </div>
    
    </Link>
  )
}

export default ProFastLogo