const { Link } = ReactRouterDOM

import { userService } from '../services/user.service.js'
import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug }) {

    const user = userService.getLoggedinUser()

    function isOwner(bug) {
        if (!user) return false
        return user.isAdmin || bug.owner._id === user._id
    }

    if (!bugs) return <div>Loading...</div>
    return (
        <ul className="bug-list">
            {bugs.map((bug) =>
                <li className="bug-preview" key={bug._id}>
                    <BugPreview bug={bug} />
                    {
                        isOwner(bug) &&
                        <div>
                            <button onClick={() => onRemoveBug(bug._id)}>x</button>
                            <button><Link to={`/bug/edit/${bug._id}`}>Edit</Link></button>
                        </div>
                    }
                    <Link to={`/bug/${bug._id}`}>Details</Link>
                </li>
            )}
        </ul >
    )
}
