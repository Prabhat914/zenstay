import React from 'react'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: "" }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: String(error?.message || "Something went wrong while loading Zenstay.")
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary", error, errorInfo)
  }

  handleReset = () => {
    localStorage.removeItem("zenstay_user")
    localStorage.removeItem("zenstay_token")
    localStorage.removeItem("zenstay_local_listings")
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className='min-h-screen bg-white flex items-center justify-center px-[20px]'>
        <div className='max-w-[520px] w-[100%] border border-[#e8dede] rounded-[24px] p-[24px] shadow-sm flex flex-col gap-[14px]'>
          <div className='text-[28px] font-semibold text-[#3b2a2a]'>Zenstay could not load.</div>
          <div className='text-[16px] text-[#6b5b5b]'>{this.state.message}</div>
          <button
            type="button"
            onClick={this.handleReset}
            className='w-fit px-[22px] py-[10px] rounded-[12px] bg-[red] text-white'
          >
            Reset and Reload
          </button>
        </div>
      </div>
    )
  }
}

export default AppErrorBoundary
