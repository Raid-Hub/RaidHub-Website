import Profile from "./Profile"
import { NextPage } from "next"
import { InitialProfileProps } from "../../types/profile"
import Custom404 from "../../pages/404"
import { useState } from "react"
import ErrorComponent from "../global/Error"
import CustomError from "../../models/errors/CustomError"

const ProfileWrapper: NextPage<InitialProfileProps> = props => {
    const [error, setError] = useState<CustomError | null>(null)
    if (error) {
        return <ErrorComponent error={error} />
    } else if (!props) {
        return <Custom404 error="Not found" />
    } else {
        return <Profile {...props} errorHandler={setError} />
    }
}

export default ProfileWrapper
