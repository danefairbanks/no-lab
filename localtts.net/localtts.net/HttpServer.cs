using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace localtts.net
{
    public class HttpServer
    {
        #region Events

        public class RequestReceivedArgs
        {
            public HttpListenerContext Context { get; set; }
        }
        public event EventHandler<RequestReceivedArgs> RequestReceived;
        public class MessageReceivedArgs
        {
            public Guid Connection { get; set; }
            public string Message { get; set; }
        }
        public event EventHandler<MessageReceivedArgs> MessageReceived;

        #endregion

        public async void Start(params string[] prefixes)
        {
            HttpListener listener = new HttpListener();
            foreach (var prefix in prefixes) listener.Prefixes.Add(prefix);
            listener.Start();

            while (true)
            {
                HttpListenerContext context = await listener.GetContextAsync();
                if (context.Request.IsWebSocketRequest) ProcessWsRequest(context);
                else ProcessRequest(context);
            }
        }

        private void ProcessRequest(HttpListenerContext context)
        {
            if (RequestReceived != null) RequestReceived(this, new RequestReceivedArgs { Context = context });
        }

        //  Store connections in a dictionary by guid
        private Dictionary<Guid, WebSocket> _webSockets = new Dictionary<Guid, WebSocket>();
        //  Message could be sent in pieces, save in buffer
        private StringBuilder _messageBuffer = new StringBuilder();

        private async void ProcessWsRequest(HttpListenerContext context)
        {
            //  Try to get the context
            WebSocketContext wsContext = null;
            try
            {
                wsContext = await context.AcceptWebSocketAsync(subProtocol: null);
                string ipAddress = context.Request.RemoteEndPoint.Address.ToString();
            }
            catch
            {
                context.Response.StatusCode = 500;
                context.Response.Close();
                return;
            }

            //  Get the websocket, assign new id and start listening on connection
            WebSocket ws = wsContext.WebSocket;
            Guid connection = Guid.NewGuid();
            _webSockets.Add(connection, ws);
            try
            {
                byte[] buffer = new byte[1024];
                while (ws.State == WebSocketState.Open)
                {
                    WebSocketReceiveResult result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Console.WriteLine("Closing {0}", connection);
                        await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                        Console.WriteLine("Closed {0}", connection);
                    }
                    else if (result.MessageType == WebSocketMessageType.Text)
                    {
                        //  Encode result into string buffer
                        _messageBuffer.Append(Encoding.Default.GetString(buffer, 0, result.Count));
                        // Raise event when message is completed
                        if (result.EndOfMessage)
                        {
                            var message = _messageBuffer.ToString();
                            Console.WriteLine("Received message from {0}: {1}", connection, message);
                            if (MessageReceived != null) MessageReceived(this, new MessageReceivedArgs()
                            {
                                Connection = connection,
                                Message = message
                            });
                            _messageBuffer.Clear();
                        }
                    }
                }
            }
            catch
            {

            }
            finally
            {
                // Dispose and remove connection from dictionary
                if (ws != null)
                {
                    _webSockets.Remove(connection);
                    ws.Dispose();
                    Console.WriteLine("Connection released {0}", connection);
                }
            }
        }

        //  Send to all connections
        public async Task Broadcast(string message)
        {
            foreach (WebSocket ws in _webSockets.Values)
                await _send(ws, message);
            Console.WriteLine("Message broadcasted: {0}", message);
        }

        //  Send to specific connection
        public async Task Send(Guid connection, string message)
        {
            var ws = _webSockets[connection];
            await _send(ws, message);
            Console.WriteLine("Message sent to {0}: {1}", connection, message);
        }

        //  Send message through websocket helper
        private async Task _send(WebSocket ws, string message)
        {
            byte[] buffer = Encoding.Default.GetBytes(message);
            if (ws.State == WebSocketState.Open)
                await ws.SendAsync(new ArraySegment<byte>(buffer, 0, buffer.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }
}
