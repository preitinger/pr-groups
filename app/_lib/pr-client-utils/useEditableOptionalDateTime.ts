import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { formatDateTime, parseGermanDate, standardJavascriptDateTimeString } from "../utils";

export interface EditableOptionalDateTimeProps {
    optionalMs: number | null;
    setOptionalMs: (ms: number | null) => void;
}
export type EditableOptionalDateTimeResult = [
    enabled: boolean,
    setEnabled: (enabled: boolean) => void,
    editedText: string,
    setEditedText: Dispatch<SetStateAction<string>>,
    editing: boolean,
    setEditing: Dispatch<SetStateAction<boolean>>,
    onOk: () => void,
    onCancel: () => void,
    unclearMESZ: boolean,
    userMESZ: boolean,
    setUserMESZ: Dispatch<SetStateAction<boolean>>,
    error: string

]

export default function useEditableOptionalDateTime({ optionalMs, setOptionalMs }: EditableOptionalDateTimeProps): EditableOptionalDateTimeResult {
    const [enabled, setEnabled] = useState(false);
    const [editedText, setEditedText] = useState('');
    const [editing, setEditing] = useState(false);
    const lastMs = useRef<number | null>(null);
    // const [lastMs, setLastMs] = useState<number|null>(null);
    const [error, setError] = useState('');
    const [unclearMESZ, setUnclearMESZ] = useState(false);
    const [userMESZ, setUserMESZ] = useState(false);

    useEffect(() => {
        if (Number.isSafeInteger(optionalMs)) {
            setEnabled(true);
        } else {
            setEnabled(false);
        }
        // setEditing(false);
    }, [optionalMs])

    useEffect(() => {
        if (editing) {
            setEditedText(formatDateTime(optionalMs))
        }
    }, [editing, optionalMs])

    useEffect(() => {
        if (!editing) return;
        const res = parseGermanDate(editedText)

        if (res == null) {
            setError('Datum/Uhrzeit ungültig!');
            return;
        }
        if (Array.isArray(res)) {
            setUnclearMESZ(true);
            setError('');
            return;
        }
        setUnclearMESZ(false);
        setUserMESZ(res.getTimezoneOffset() === -120);
        setError('');

    }, [editing, editedText, userMESZ])

    const onOk = useCallback(() => {
        if (!editing) return;
        const res = parseGermanDate(editedText)

        if (res == null) {
            setError('Datum/Uhrzeit ungültig!');
            return;
        }
        if (Array.isArray(res)) {
            setUnclearMESZ(true);
            setError('');
            setEditing(false);
            setOptionalMs(new Date(standardJavascriptDateTimeString(res[0], res[1], res[2], res[3], res[4], userMESZ)).getTime())
            return;
        }
        setUnclearMESZ(false);
        setUserMESZ(res.getTimezoneOffset() === -120);
        setError('');
        setEditing(false);
        setOptionalMs(res.getTime());

    }, [editing, editedText, userMESZ, setOptionalMs])

    const onCancel = useCallback(() => {
        if (!editing) return;
        setEditing(false);

    }, [editing])

    const outerSetEnabled = useCallback((enabled: boolean) => {
        console.log('outerSetEnabled', enabled, optionalMs, lastMs.current)
        setEnabled(enabled)
        if (!enabled) {
            lastMs.current = optionalMs
            setOptionalMs(null);
        } else {
            if (lastMs.current == null) {
                setOptionalMs(Date.now())
                setEditing(true);
    
            } else {
                setOptionalMs(lastMs.current)
            }
        }
    }, [optionalMs, setOptionalMs])

    return [
        enabled,
        outerSetEnabled,
        editedText,
        setEditedText,
        editing,
        setEditing,
        onOk,
        onCancel,
        unclearMESZ,
        userMESZ,
        setUserMESZ,
        error
    ]
}