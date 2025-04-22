document.addEventListener('DOMContentLoaded', function() {
    const contractAddressInput = document.getElementById('contract-address');
    const tokenIdInput = document.getElementById('token-id');
    const searchBtn = document.getElementById('search-btn');
    const holderAddresses = document.getElementById('holder-addresses');
    const holderTitle = document.getElementById('holder-title');
    const copyBtn = document.getElementById('copy-btn');
    const sendBtn = document.getElementById('send-btn');
    const nftImage = document.getElementById('nft-image');
    const nftTitle = document.getElementById('nft-title');
    const nftDescription = document.getElementById('nft-description');
    
    searchBtn.addEventListener('click', async function() {
        holderAddresses.textContent = 'Loading...';
        holderTitle.textContent = 'NFT 持有者：';
        nftTitle.textContent = 'Loading...';
        nftDescription.textContent = 'Loading...';
        nftImage.classList.add('hidden');
        
        const contractAddress = contractAddressInput.value.trim();
        const tokenId = tokenIdInput.value.trim();
        
        if (!contractAddress || !tokenId) {
            holderAddresses.textContent = '請輸入合約地址和Token ID';
            return;
        }
        
        try {
            await Promise.all([
                fetchHolderInfo(contractAddress, tokenId),
                fetchTokenMetadata(contractAddress, tokenId)
            ]);
            
        } catch (error) {
            console.error('API請求失敗:', error);
            holderAddresses.textContent = `查詢錯誤: ${error.message}`;
            nftTitle.textContent = 'API查詢錯誤';
            nftDescription.textContent = '無法加載NFT資訊';
        }
    });
    
    async function fetchHolderInfo(contractAddress, tokenId) {
        try {
            const apiUrl = new URL('https://api.tzkt.io/v1/tokens/balances');
            apiUrl.searchParams.append('token.contract', contractAddress);
            apiUrl.searchParams.append('token.tokenId', tokenId);
            apiUrl.searchParams.append('balance.gt', '0');
            apiUrl.searchParams.append('limit', '10000');
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`持有者API錯誤: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                holderAddresses.textContent = '未找到持有者資訊';
                holderTitle.textContent = 'NFT 持有者：(共0位)';
                return;
            }
            
            const addresses = data.map(item => item.account?.address || '未知地址');
            
            holderTitle.textContent = `NFT 持有者：(共${addresses.length}位)`;
            
            holderAddresses.textContent = addresses.join('\n');
            
        } catch (error) {
            console.error('持有者API請求失敗:', error);
            holderAddresses.textContent = `持有者查詢錯誤: ${error.message}`;
            holderTitle.textContent = 'NFT 持有者：(共0位)';
            throw error;
        }
    }
    
    async function fetchTokenMetadata(contractAddress, tokenId) {
        try {
            const apiUrl = new URL('https://api.tzkt.io/v1/tokens');
            apiUrl.searchParams.append('contract', contractAddress);
            apiUrl.searchParams.append('tokenId', tokenId);
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`API錯誤: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                nftTitle.textContent = '未找到NFT資訊';
                nftDescription.textContent = '無法加載NFT詳情';
                return;
            }
            
            const metadata = data[0].metadata;
            
            if (!metadata) {
                nftTitle.textContent = '無metadata資訊';
                nftDescription.textContent = '無metadata資訊';
                return;
            }
            
            nftTitle.textContent = metadata.name || 'NFT 標題未提供';
            nftDescription.textContent = metadata.description || 'NFT 描述未提供';
            
            if (metadata.thumbnailUri) {
                let imageUrl = metadata.thumbnailUri;
                
                if (imageUrl.startsWith('ipfs://')) {
                    imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                }
                
                nftImage.src = imageUrl;
                nftImage.alt = metadata.name || 'NFT 圖像';
                nftImage.classList.remove('hidden');
            }
            
        } catch (error) {
            console.error('metadata API請求失敗:', error);
            nftTitle.textContent = 'metadata查詢錯誤';
            nftDescription.textContent = `無法獲取NFT詳情: ${error.message}`;
            throw error;
        }
    }
    
    copyBtn.addEventListener('click', function() {
        const text = holderAddresses.textContent;
        
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            alert('已複製到剪貼板');
        } catch (err) {
            console.error('複製失敗:', err);
            alert('複製失敗，請手動複製');
        }
        
        document.body.removeChild(textArea);
    });
    
    sendBtn.addEventListener('click', function() {
        window.open('https://akaswap.com/nako', '_blank');
    });
});