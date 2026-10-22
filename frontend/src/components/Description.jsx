function Description({ description }) {
    return (
        <div className="w-full overflow-hidden">
            <div
                className="prose max-w-none rounded-lg break-words
                [&_img]:max-w-full [&_img]:h-auto
                [&_pre]:overflow-x-auto [&_pre]:max-w-full
                [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto
                [&_iframe]:max-w-full"
            >
                {description ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                ) : (
                    <p className="text-gray-500">No description provided.</p>
                )}
            </div>
        </div>
    );
}

export default Description;