import { AccordionItem } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";

export default function BootstrapAccordion() {
    return <Accordion defaultActiveKey={'0'}>
        <Accordion.Item eventKey='0'>
            <Accordion.Header>Bootstrap Title 1</Accordion.Header>
            <Accordion.Body>
                <div>bla 1</div>
            </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey='1'>
            <Accordion.Header>Bootstrap Title 2</Accordion.Header>
            <Accordion.Body>
                <div>bla 2</div>
            </Accordion.Body>
        </Accordion.Item>
    </Accordion>
}