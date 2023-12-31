

export function BugPreview({ bug }) {

    return <article>
        <h4>{bug.title}</h4>
        <h1>🐛</h1>
        <p>Severity: <span>{bug.severity}</span></p>
        {bug.owner && <h4>Owner: {bug.owner.fullname}</h4>}
    </article>
}