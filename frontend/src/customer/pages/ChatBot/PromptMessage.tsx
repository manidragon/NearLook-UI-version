
interface PromptMessageProps{
    message:string,
    index:number
}
const PromptMessage = ({message}:PromptMessageProps) => {
  const displayMessage = typeof message === 'object' && message !== null ? (message as any).message || JSON.stringify(message) : message;
  return (
    <div className='px-3 py-4 bg-[#FF5A00] text-white rounded-2xl rounded-tr-none shadow-sm text-sm'>{displayMessage}</div>
  )
}

export default PromptMessage