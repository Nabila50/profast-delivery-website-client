import React from 'react';
import useAuth from '../hooks/useAuth';
import useUserRole from '../hooks/useUserRole';
import { Navigate } from 'react-router';

const RiderRoute = ({children}) => {
     const {user, loading} = useAuth();

    const {role, roleLoading} = useUserRole();

    if(loading || roleLoading){
        return <span className='loading loading-infinity loading-xl'></span>
    }

    if(!user || role !== 'rider'){
        return <Navigate state={{ from: location.path}} to='/forbidden'></Navigate>
    }
  return children
};

export default RiderRoute;