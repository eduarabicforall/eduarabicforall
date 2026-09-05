import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Icon from '../components/Icon'

export default function CheckoutDone() {
  return (
    <div className="min-h-screen bg-app-bg px-5 py-6 max-w-lg mx-auto flex flex-col items-center justify-center text-center">
      <Icon name="checkmark-circle-02" size={56} className="text-app-primary mb-4" />
      <h1 className="font-title font-extrabold text-2xl mb-2">Order placed!</h1>
      <p className="text-app-inkSoft text-sm mb-8">Your activation code arrives with the module.</p>
      <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
    </div>
  )
}
