
"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "flowbite-react";

interface Props {
    title: string;
    buttonText?: string;
    className?: string;
    closeAble?: boolean;
    children: React.ReactNode;
    actionbuttons: ActionButton[];
    show?: boolean;
}

interface ActionButton {
    text: string;
    color?: string;
    onClick: () => void;
    closeModal?: boolean;
}

export function CRUDModal({ actionbuttons, children, title, buttonText, className, closeAble = true, show = false }: Props) {
    const [openModal, setOpenModal] = useState(show);

    useEffect(() => {
        setOpenModal(show);
    }, [show]);

    return (
        <>
            {!!buttonText && <button className={className} onClick={() => setOpenModal(true)}>{buttonText}</button>}
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
