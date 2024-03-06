import { type Metadata } from "next"
import AddVanityForm from "~/components/__deprecated__/admin/AddVanityForm"
import RemoveVanityForm from "~/components/__deprecated__/admin/RemoveVanityForm"
import { Flex } from "~/components/layout/Flex"
import { PageWrapper } from "~/components/layout/PageWrapper"

export default async function Page() {
    return (
        <PageWrapper>
            <h1>Admin Panel</h1>
            <Flex $direction="column" $crossAxis="flex-start">
                <AddVanityForm />
                <RemoveVanityForm />
            </Flex>
        </PageWrapper>
    )
}

export const metadata: Metadata = {
    title: "Admin Dashboard"
}