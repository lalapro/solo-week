// import miner from 'html-miner'
import axios from 'axios';


export default scrape = () => {
  // miner('https://www.buycott.com/upc/021908509273', '.centered_image header_image');
  axios.get('https://www.barcodelookup.com/0014100075233')
    .then(html => {
      data = html.data.split(' ')
      for (let i = 500; i < data.length; i++) {
        console.log(i, data[i])
      }
    })
    .catch(err => console.log(err))
}
