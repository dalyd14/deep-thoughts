import React, { useState } from 'react'

import { useMutation } from '@apollo/react-hooks'
import { QUERY_THOUGHTS, QUERY_ME } from '../../utils/queries'
import { ADD_THOUGHT } from '../../utils/mutations'

const ThoughtForm = () => {
    const [thoughtText, setText] = useState('')
    const [characterCount, setCount] = useState(0)

    const [addThought, {error}] = useMutation(ADD_THOUGHT, {
        update(cache, { data: { addThought } }) {
            
            try {
                const { thoughts } = cache.readQuery({ query: QUERY_THOUGHTS })

                cache.writeQuery({
                    query: QUERY_THOUGHTS,
                    data: { thoughts: [addThought, ...thoughts] }
                })
            } catch (e) {
                console.error(e)
            }

            const { me } = cache.readQuery({ query: QUERY_ME })
            cache.writeQuery({
                query: QUERY_ME,
                data: { me: { ...me, thoughts: [...me.thoughts, addThought]}}
            })

        }
    })

    const handleChange = event => {
        if (event.target.value.length <= 280) {
            setText(event.target.value)
            setCount(event.target.value.length)
        }
    }

    const handleFormSubmit = async event => {
        event.preventDefault()

        try {
            await addThought({
                variables: { thoughtText }
            })
            setText('')
            setCount(0)
        } catch (e) {
            console.error(e)
        }

    }

    return (
        <div>
            <p className={`m-0 ${characterCount === 280 ? 'text-error' : ''}`}>
                Character Count: {characterCount}/280
                {error && <span className="ml-2">Something went wrong...</span>}
            </p>
            <form onSubmit={handleFormSubmit} className="flex-row justify-center justify-space-between-md align-stretch">
                <textarea 
                    placeholder="Here's a new thought..."
                    value={thoughtText}
                    className="form-input col-12 col-md-9"
                    onChange={handleChange}>
                </textarea>
                <button className="btn col-12 col-md-3" type="submit">
                    Submit
                </button>
            </form>
        </div>
    )
}

export default ThoughtForm