type Props = {
    error: string
}

const ErrorMessage = ({error}: Props) => {
    return (
        <div>
            {error}
        </div>
    )
}

export default ErrorMessage