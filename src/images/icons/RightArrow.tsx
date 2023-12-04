import SVG, { SVGProps } from "~/components/reusable/SVG"

export default function RightArrow(props: SVGProps) {
    return (
        <SVG viewBox="0 0 25 25" fill="var(--brand-orange-light)" {...props}>
            <path d="M8.29289 7.20711C7.90237 6.81658 7.90237 6.18342 8.29289 5.79289C8.68342 5.40237 9.31658 5.40237 9.70711 5.79289L15.7071 11.7929C16.0857 12.1715 16.0989 12.7811 15.7372 13.1757L10.2372 19.1757C9.86396 19.5828 9.23139 19.6103 8.82427 19.2372C8.41716 18.864 8.38965 18.2314 8.76284 17.8243L13.6159 12.5301L8.29289 7.20711Z" />
        </SVG>
    )
}
