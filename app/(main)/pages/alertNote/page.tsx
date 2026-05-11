'use client';

import React, { useEffect, useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

import { getAllAleartNotes, createAleartNote, updateAleartNote, aleartNoteType } from '@/firebaseUtils';

const AleartNote = () => {
    const [form, setForm] = useState<aleartNoteType>({
        uid: '',
        alertNote: ''
    });

    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);

    // ✅ Load existing note
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const data = await getAllAleartNotes();

                if (data) {
                    // Since only one object is needed
                    const firstEntry = Object.values(data)[0] as aleartNoteType;

                    if (firstEntry) {
                        setForm(firstEntry);
                        setIsEdit(true);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // ✅ Handle input change
    const handleChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            alertNote: value
        }));
    };

    // ✅ Submit / Update
    const handleSubmit = async () => {
        try {
            if (isEdit && form.uid) {
                await updateAleartNote(form.uid, form);
                alert('Alert note updated successfully');
            } else {
                const newNote = await createAleartNote(form);
                setForm(newNote);
                setIsEdit(true);
                alert('Alert note created successfully');
            }
        } catch (error) {
            console.error(error);
        }
    };

    

    return (
        <div className="card">
            <h3 className="mb-4 text-xl font-bold">Alert Note</h3>

            <div className="grid">
                <div className="col-12">
                    <label className="block font-bold mb-2">Alert Note</label>

                    <InputTextarea value={form.alertNote} onChange={(e) => handleChange(e.target.value)} rows={6} placeholder="Enter alert note..." className="w-full" />
                </div>
            </div>

            <div className="mt-4">
                <Button label={isEdit ? 'Update' : 'Submit'} onClick={handleSubmit} />
            </div>
        </div>
    );
};

export default AleartNote;
