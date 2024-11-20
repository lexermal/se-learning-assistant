
"use client";

import { useState } from "react";
import { Button, Modal } from "flowbite-react";

interface Props {
    title: string;
    buttonText: string;
    closeAble?: boolean;
    children: React.ReactNode;
    actionbuttons: ActionButton[];
}

interface ActionButton {
    text: string;
    color?: string;
    onClick: () => void;
    closeModal?: boolean;
}

export function CardCRUDModal({ actionbuttons, children, title, buttonText, closeAble = true }: Props) {
    const [openModal, setOpenModal] = useState(false);

    return (
        <>
            <button className="ml-auto bg-blue-500 text-white p-2 rounded-lg" onClick={() => setOpenModal(true)}>{buttonText}</button>
            <Modal dismissible={closeAble} show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>{title}</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        {children}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {actionbuttons.map(({ onClick, text, closeModal = true, color = "gray" }, index) => (
                        <Button key={index} color={color} onClick={() => {
                            if (closeModal) setOpenModal(false);
                            onClick();
                        }}>{text}</Button>
                    ))}
                </Modal.Footer>
            </Modal>
        </>
    );
}
