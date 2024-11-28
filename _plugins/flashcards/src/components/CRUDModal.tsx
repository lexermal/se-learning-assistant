
"use client";

import { Modal } from "flowbite-react";
import { useEffect, useState } from "react";

interface Props {
    title: string;
    show?: boolean;
    className?: string;
    closeAble?: boolean;
    children: React.ReactNode;
    actionbuttons: ActionButton[];
    buttonText?: string | React.ReactNode;
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
                    {children}
                </Modal.Body>
                <Modal.Footer>
                    {actionbuttons.map(({ onClick, text, closeModal = true, color = "gray" }, index) => (
                        <button key={index} color={color}
                        className={"border-2 border-"+color+"-900 rounded-md py-2 px-4 bg-"+color+"-900 text-white font-bold"}
                        onClick={() => {
                            if (closeModal) setOpenModal(false);
                            onClick();
                        }}>{text}</button>
                    ))}
                </Modal.Footer>
            </Modal>
        </>
    );
}
