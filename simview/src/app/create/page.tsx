import { Collapsible } from '~/components/Collapsible'
import {
  Form
} from '~/components/Forms'

export default function Page() {
  return (
    <Form action="/api/worker/create" method="POST"/>
  )
}
