import { Github, GithubIcon, Globe, Twitter, X, XIcon, Youtube } from 'lucide-react'
import Link from 'next/link'

/**
 * i stole this footer design, credit to:
 * https://dub.co/
 */

const Footer = () => {
  return (
    <footer className='bg-blue-50'>
      <div className='p-6 bg-white mx-auto relative z-10 overflow-hidden border border-b-0 border-gray-200'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <Link href='/'>
            {/* <LogoType className='h-7 text-gray-800' /> */}
          </Link>
          <p className='max-w-md text-sm text-gray-500'>
            A project made with ❤️ by Ryan Hatton
          </p>
          <p className='text-sm leading-5 text-gray-400'>
            © {new Date().getFullYear()} SoapbarAPI
          </p>
          <div className='flex items-center space-x-3'>
            <a
              href='https://x.com/@hiryanhatton'
              target='_blank'
              rel='noreferrer'
              className='group rounded-full border border-gray-200 p-2 transition-colors hover:bg-gray-100'>
              <span className='sr-only'>Twitter</span>
              <Twitter className='h-4 w-4 text-gray-600 transition-colors group-hover:text-black' />
            </a>
            <a
              href='https://github.com/ryanhatton/'
              target='_blank'
              rel='noreferrer'
              className='group rounded-full border border-gray-200 p-2 transition-colors hover:bg-gray-100'>
              <span className='sr-only'>Github</span>
              <GithubIcon className='h-4 w-4 text-gray-600 transition-colors group-hover:text-black' />
            </a>

            <a
              href='https://www.ryanhatton.net'
              target='_blank'
              rel='noreferrer'
              className='group rounded-full border border-gray-200 p-2 transition-colors hover:bg-gray-100'>
              <span className='sr-only'>Website</span>
              <Globe className='h-4 w-4 text-gray-600 transition-colors group-hover:text-[#00ffd0]' />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer