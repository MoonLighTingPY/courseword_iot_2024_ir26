from flask import jsonify, request

class MinHeap:
    def __init__(self):
        self.heap = [10, 20, 15, 30, 40, 25, 18]
        self.steps = []  # для візуалізації кроків
        
    def contains(self, i):
        if i in self.heap:
            return True
        else: 
            return False
    
    def bfs_search(self, value):
        if not self.heap:
            return [], f"Heap is empty"

        queue = [(0, [0])]  
        
        while queue:
            index, path = queue.pop(0)
            
            if index >= len(self.heap):
                continue
            
            if self.heap[index] == value:
                return path, None

            left_child_index = 2 * index + 1
            right_child_index = 2 * index + 2
            
            # дивимося чи індекси дітей не виходить за баунд купи
            if left_child_index < len(self.heap):
                queue.append((left_child_index, path + [left_child_index]))
                
            if right_child_index < len(self.heap):
                queue.append((right_child_index, path + [right_child_index]))
        
        return [], f"Value {value} not found in heap"
         
    def parent(self, i):
        return (i - 1) // 2
        
    def left_child(self, i):
        return 2 * i + 1
        
    def right_child(self, i):
        return 2 * i + 2
        
    def swap(self, i, j):
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]
        
    def heapify_up(self, i):
        current = i
        while current > 0 and self.heap[self.parent(current)] > self.heap[current]:
            # зберегти крок для візуалізації
            self.steps.append({
                "heap": self.heap.copy(),
                "comparing": [current, self.parent(current)],
                "swapping": True
            })
            
            self.swap(current, self.parent(current))
            current = self.parent(current)
            
        # зберегти крок коли немає більше змін
        self.steps.append({
            "heap": self.heap.copy(),
            "comparing": [],
            "swapping": False
        })
        
    def heapify_down(self, i):
        size = len(self.heap)
        smallest = i
        left = self.left_child(i)
        right = self.right_child(i)
        
        
        if left < size and self.heap[left] < self.heap[smallest]:
            smallest = left
            
        if right < size and self.heap[right] < self.heap[smallest]:
            smallest = right
            
        if smallest != i:
            # зберегти крок для візуалізації
            self.steps.append({
                "heap": self.heap.copy(),
                "comparing": [i, smallest],
                "swapping": True
            })
            
            self.swap(i, smallest)
            self.heapify_down(smallest)
        else:
            # зберегти крок коли немає більше змін
            self.steps.append({
                "heap": self.heap.copy(),
                "comparing": [],
                "swapping": False
            })
            
    def insert(self, value):
        self.steps = []  # ресет для нової операції
        self.heap.append(value)
        # зберегти початковий стан
        self.steps.append({
            "heap": self.heap.copy(),
            "comparing": [],
            "swapping": False,
            "message": f"Adding {value} to the heap"
        })
        self.heapify_up(len(self.heap) - 1)
        return self.steps
        
    def get_min(self):
        self.steps = []  

        if not self.heap:
            self.steps.append({
                "heap": self.heap.copy(),
                "comparing": [],
                "swapping": False,
                "message": "Heap is empty, no minimum value"
            })
            return None, self.steps

        min_val = self.heap[0]  

        self.steps.append({
            "heap": self.heap.copy(),
            "comparing": [0], 
            "swapping": False,
            "message": f"Minimum value is {min_val}"
        })

        return min_val, self.steps
    
    def extract_min(self):
        if not self.heap:
            return None, []
            
        self.steps = [] 
        

        self.steps.append({
            "heap": self.heap.copy(),
            "comparing": [],
            "swapping": False,
            "message": "Extracting minimum element"
        })
        
        if len(self.heap) == 1:
            min_val = self.heap.pop()
            self.steps.append({
                "heap": self.heap.copy(),
                "comparing": [],
                "swapping": False,
                "message": f"Extracted {min_val}, heap is now empty"
            })
            return min_val, self.steps
            
        min_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        

        self.steps.append({
            "heap": self.heap.copy(),
            "comparing": [],
            "swapping": True,
            "message": f"Moved last element to root, now heapifying"
        })
        
        self.heapify_down(0)
        
        return min_val, self.steps


def create_routes(app):
    heap = MinHeap()
    
    @app.route("/min-healp/search", methods=['POST'])
    def search_value():
        data = request.json
        value = int(data['value'])

        path, error = heap.bfs_search(value)
        if error:
            return jsonify({"error": error}), 404
        
        path_values = [heap.heap[index] for index in path]  
        return jsonify({
            "path": path_values,
            "indices": path
        })

    @app.route('/min-heap/get-min', methods=['GET'])
    def get_min():
        min_val, steps = heap.get_min()
        if min_val is None:
            return jsonify({
                "error": "Heap is empty",
                "steps": steps
            }), 404
        
        return jsonify({
            "minimumValue": min_val,
            "steps": steps
        })

    @app.route('/min-heap/insert', methods=['POST'])
    def insert_value():
        data = request.json
        value = int(data['value'])

        if heap.contains(value) == True:
            return jsonify({
                "error": "Node already exist"
            })
        
        steps = heap.insert(value)
        return jsonify({
            "steps": steps,
            "currentHeap": heap.heap
        })
        
    @app.route('/min-heap/extract', methods=['POST'])
    def extract_min():
        min_val, steps = heap.extract_min()
        return jsonify({
            "extractedValue": min_val,
            "steps": steps,
            "currentHeap": heap.heap
        })
        
        
    @app.route('/min-heap/print', methods=['GET'])
    def print_heap():
        return jsonify({
            "print": heap.heap
        })
    
    @app.route('/min-heap/clear', methods=['POST'])
    def clear_heap():
        heap.heap = []
        heap.steps = []
        return jsonify({
            "message": "Heap cleared",
            "currentHeap": heap.heap
        })
        
    @app.route('/min-heap/remove', methods=['POST'])
    def remove_node():
        data = request.json
        value = int(data['value'])
        heap.steps = []
        
        try:

            index = heap.heap.index(value)
            

            heap.steps.append({
                "heap": heap.heap.copy(),
                "comparing": [index],
                "swapping": False,
                "message": f"Found value {value} at index {index}"
            })

            last_value = heap.heap.pop()
            if index < len(heap.heap):
                heap.heap[index] = last_value
                heap.steps.append({
                    "heap": heap.heap.copy(),
                    "comparing": [index],
                    "swapping": True,
                    "message": f"Replaced {value} with last element {last_value}"
                })
                heap.heapify_down(index)
            
            return jsonify({
                "steps": heap.steps,
                "currentHeap": heap.heap
            })
            
        except ValueError:
            return jsonify({
                "error": f"Value {value} not found in heap"
            }), 404