'use client'

import Input2 from "@/app/_lib/pr-client-utils/Input2";
import FormComp from "@/app/_lib/pr-client-utils/FormComp";
import { useState } from "react";
import { myCssSupports } from "@/app/_lib/pr-client-utils/myCssSupports";

export default function Page() {
    const [width, setWidth] = useState<string>('810px');
    const [height, setHeight] = useState<string>('600px');
    const [age, setAge] = useState('0');
    const [eye, setEye] = useState('');
    const [maxWidth, setMaxWidth] = useState('800')
    const [maxHeight, setMaxHeight] = useState('600')

    function validateEye(t: string) {
        return t === 'braun' || t === 'blau' ? '' : 'Nur braun oder blau erlaubt ;-)'
    }

    return (
        <div style={{
            border: '3px solid blue',
            backgroundColor: 'inherit'
        }}>
            <Input2 type='text' label='Breite' text={width} setText={setWidth} validate={(text) => 
                 (myCssSupports('width', width)) ? '' : 'Ungültiger CSS-String!'
            } />
            <Input2 type='text' label='Höhe' text={height} setText={setHeight} validate={(text) => 
                 (myCssSupports('height', height)) ? '' : 'Ungültiger CSS-String!'
            } />
            <Input2 type='number' label='maxWidth' text={maxWidth} setText={setMaxWidth} />
            <Input2 type='number' label='maxHeight' text={maxHeight} setText={setMaxHeight} />

            <div style={{
                width: myCssSupports('width', width) ? width : 'auto',
                height: true ? 'auto' : myCssSupports('height', height) ? height : 'auto',
                border: '5px solid gold'
            }}>
                <FormComp maxWidth={Number.parseInt(maxWidth)} maxHeight={Number.parseInt(maxHeight)}>
                    <Input2 type='text' label='Augenfarbe' text={eye} setText={setEye} validate={validateEye} />
                    <Input2 type='number' label='Alter in Jahren' text={age} setText={setAge} />
                </FormComp>
            </div>
        </div>
    )
}