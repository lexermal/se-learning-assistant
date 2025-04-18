export default function SettingsEntry(props: { title: string, description: string, children: React.ReactNode }) {
    return <div className=" dark:text-gray-100 text-xl flex flex-row flex-wrap 
    items-center rounded p-2 mb-3 w-full">
        <p className="text-lg w-full font-bold">{props.title}</p>
        <p className="text-sm">{props.description}</p>
        <div className="w-full pt-2">
            {props.children}
        </div>
    </div>
}
