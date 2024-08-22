'use client'

import Accordion from "@/app/_lib/pr-client-utils/Accordion";
import AccordionPage from "@/app/_lib/pr-client-utils/AccordionPage";
import BootstrapAccordion from "./BootstrapAccordion";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { useState } from "react";

export default function Page() {
    const [x, setX] = useState<number>(0);
    const [checked, setChecked] = useState(false)
    console.log('checked', checked, 'x', x);
    return (
        <Container >
            <Button >test button</Button>
            <Accordion multiOpen={false}>
                <AccordionPage header="Page 1">
                    <h1>Content page 1</h1><p>bla bla</p>
                </AccordionPage>
                <AccordionPage header="Page 2">
                    <h1>Content page 2</h1><p>More bla bla</p>
                </AccordionPage>
            </Accordion>
            <Accordion multiOpen={true} defaultOpen={[0]}>
                <AccordionPage header='Multi 1'>
                    Erst einmal bla bla
                </AccordionPage>
                <AccordionPage header='Multi 2'>
                    Dann aber bla bla
                </AccordionPage>
            </Accordion>

            <Form className='p-3 mt-5' >
                <BootstrapAccordion />
                <InputGroup>
                    <InputGroup.Checkbox checked={checked} onChange={(e) => {
                        setChecked(e.target.checked)
                    }} />
                    <InputGroup.Text>Kapazität</InputGroup.Text>
                    <FormControl type='number' value={x} onChange={(e) => setX(parseInt(e.target.value))} disabled={!checked} />
                </InputGroup>
            </Form>
        </Container>
    )
}