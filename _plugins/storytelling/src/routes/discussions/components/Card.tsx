interface Props {
  src: string;
  title: string;
  description: string;
  success?: boolean;
  onClick?: () => void;
}

export default function Card(props: Props): JSX.Element {
  return (
    <div
      className={
        'max-w-sm overflow-hidden shadow-lg bg-gray-400 p-3 rounded-lg ' +
        (props.success ? '' : 'cursor-pointer')
      }
      onClick={props.success ? undefined : props.onClick}
    >
      {props.success && (
        <div className='absolute flex z-10 items-center justify-center bg-green-500'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='h-16 w-16 text-white'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
      )}
      <img
        className={'w-full rounded-lg ' + (props.success ? ' opacity-50' : '')}
        src={props.src}
        alt='opponent'
        width={500}
        height={500}
      />
      <div className={'px-6 py-4' + (props.success ? ' opacity-50' : '')}>
        <div className='font-bold text-xl mb-2'>{props.title}</div>
        <p className='text-gray-700 text-base'>{props.description}</p>
      </div>
    </div>
  );
}
