import React, { useState } from 'react'
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";


function Query(props){
    const GET_ADDRESS = gql`
    query Address($name: String){
    domains(where: {name:$name}) {
        resolvedAddress {
        id
        }
    }
    }
    `;
    const name = props.name;
    const { loading, error, data } = useQuery(GET_ADDRESS, {
        variables: {name}
    });
    let resolvedAddress = ''
    
    if(!loading && !error){
        try{
            resolvedAddress = data.domains[0].resolvedAddress.id
            alert('Success! Found ENS domain name')
            console.log(resolvedAddress)
            props.setEns(name)
            props.setFormEns(null)
        }
        catch(err){
            alert('Could not find ENS domain name, probably not registered')
            console.log(err)
        }
    }
    return (
        <></>
    )
}

class ENSForm extends React.Component{
 
    constructor(props){
        super(props)
        this.state ={
            ens: null,
        }
        this.onFormSubmit = this.onFormSubmit.bind(this)
        this.setEns = this.setEns.bind(this)
    }
    onFormSubmit = (e) => {
        e.preventDefault();
        console.log(this.refs.name.value)
        const name = this.refs.name.value
        this.setState({ens: name})

    }

    setEns = (ens) => {
        this.props.setEns(ens)
    }

    setFormEns = (ens) => {
        this.setState({ens: ens})
    }
    render(){
        return (
            <div>
                <form onSubmit={this.onFormSubmit}> 
                    <label>Enter ENS Domain Name: </label>
                    <input
                        placeholder='name.eth'
                        ref='name'
                    />
                    <input type='submit' />
                </form>
                {this.state.ens ? <Query name={this.state.ens} setEns={this.setEns} setFormEns={this.setFormEns}></Query>: null}
            </div>
        );
    }
}

export default ENSForm