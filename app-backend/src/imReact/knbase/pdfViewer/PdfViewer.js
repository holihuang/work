import React, { Component } from 'react'
import { Document, Page, setOptions } from 'react-pdf'
import { Icon } from 'antd'

// import styles from '../../../styles/less/knbase.less'

class MyPdfViewer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            page: 1,
            pages: null,
        }
        setOptions({
            cMapUrl: '../images/cmaps/',
            cMapPacked: true,
        })
    }


    onDocumentLoad = ({ numPages }) => {
        this.setState({ pages: numPages })
    }

    handlePrevious = () => {
        this.setState({ page: this.state.page - 1 })
    }

    handleNext = () => {
        this.setState({ page: this.state.page + 1 })
    }

    renderPagination = (page, pages) => {
        return (
            <nav>
                <ul className="pager">
                    <li onClick={page === 1 ? '' : this.handlePrevious} className={page === 1 ? 'viewer-left--disabled' : 'viewer-left'}><Icon type="left-circle-o" /></li>
                    <li onClick={page === pages ? '' : this.handleNext} className={page === pages ? 'viewer-right--disabled' : 'viewer-right'}><Icon type="right-circle-o" /></li>
                </ul>
            </nav>
        )
    }

    render() {
        const { page, pages, } = this.state
        const { filePath } = this.props
        let pagination = null
        if (this.state.pages) {
            pagination = this.renderPagination(this.state.page, this.state.pages)
        }
        return (
            <div className='pdfviewer-wrap'>
                <Document
                    file={filePath}
                    onLoadSuccess={this.onDocumentLoad}
                >
                    <Page pageNumber={page} />
                </Document>
                {pagination}
            </div>
        )
    }
}

export default MyPdfViewer