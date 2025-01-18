import { useRef, useEffect } from "react";

interface Props {
  show: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function DiscussionPopup(props: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const root = (document.querySelector("#root")! as HTMLDivElement)
    if (props.show) {
      dialogRef.current?.showModal();
      root.style.minHeight = (dialogRef.current!.scrollHeight + 40) + "px";
    } else {
      dialogRef.current?.close();
      root.style.minHeight = "";
    }
  }, [props.show]);

  return <dialog ref={dialogRef} className="rounded-lg font-normal w-full bg-transparent pt-[20px]" onClose={props.onClose}>
    <div className='relative shadow-gray-950 max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow-2xl dark:bg-gray-700'>
      <div className='flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600'>
        <h3 className='text-xl font-semibold text-gray-900 dark:text-white text-center w-full' style={{ paddingLeft: "40px" }}>
          {props.title}
        </h3>
        <button
          type='button'
          className='text-gray-400 focus:outline-none bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white'
          data-modal-hide='default-modal'
          onClick={props.onClose}
        >
          <svg
            className='w-3 h-3'
            aria-hidden='true'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 14 14'
          >
            <path
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
            />
          </svg>
          <span className='sr-only'>Close modal</span>
        </button>
      </div>
      <div className=''>{props.children}</div>
    </div>
  </dialog>;
}
